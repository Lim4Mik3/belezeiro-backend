import Redis from "ioredis";
import { BaseDomainEvent } from "@core/domain/events/base-domain-event";

export type EventHandler<T extends BaseDomainEvent = BaseDomainEvent> = {
  eventName: string;
  handle: (event: T) => Promise<void>;
};

enum ProcessorState {
  IDLE = "idle",
  INITIALIZING = "initializing",
  READY = "ready",
  RUNNING = "running",
  STOPPING = "stopping",
  STOPPED = "stopped",
  ERROR = "error",
}

export class RedisQueueProcessor {
  private redis: Redis;
  private handlers: Map<string, EventHandler[]> = new Map();
  private state: ProcessorState = ProcessorState.IDLE;
  private consumerGroup = "belezeiro-server";
  private consumerName = `consumer-${process.pid}`;
  private processingLoop: Promise<void> | null = null;
  private shouldRun = false;

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || "redis://localhost:6379", {
      maxRetriesPerRequest: null, // Importante para streams
      enableReadyCheck: true,
    });

    this.setupRedisEventListeners();
  }

  private setupRedisEventListeners(): void {
    this.redis.on("ready", () => {
      console.log("[QueueProcessor] Redis connection ready");
    });

    this.redis.on("error", (error) => {
      console.error("[QueueProcessor] Redis error:", error.message);
      this.state = ProcessorState.ERROR;
    });

    this.redis.on("close", () => {
      console.warn("[QueueProcessor] Redis connection closed");
    });
  }

  /**
   * Registra um handler para um evento específico
   */
  registerHandler(handler: EventHandler): void {
    const handlers = this.handlers.get(handler.eventName) || [];
    handlers.push(handler);
    this.handlers.set(handler.eventName, handlers);
    console.log(`[QueueProcessor] ✓ Registered handler for event: ${handler.eventName}`);
  }

  /**
   * Aguarda o Redis estar pronto
   */
  private async waitForRedis(): Promise<void> {
    const maxWait = 10000; // 10 segundos
    const start = Date.now();

    while (this.redis.status !== "ready") {
      if (Date.now() - start > maxWait) {
        throw new Error("[QueueProcessor] Redis not ready after 10s timeout");
      }
      console.log(`[QueueProcessor] Waiting for Redis... (status: ${this.redis.status})`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("[QueueProcessor] ✓ Redis is ready");
  }

  /**
   * Inicializa o processador (cria consumer groups)
   */
  async initialize(): Promise<void> {
    if (this.state !== ProcessorState.IDLE) {
      console.log(`[QueueProcessor] Already initialized (state: ${this.state})`);
      return;
    }

    this.state = ProcessorState.INITIALIZING;
    console.log("[QueueProcessor] Initializing...");

    try {
      // 1. Aguardar Redis estar pronto
      await this.waitForRedis();

      // 2. Verificar se há handlers registrados
      if (this.handlers.size === 0) {
        throw new Error("[QueueProcessor] No handlers registered!");
      }

      // 3. Criar consumer groups para cada evento
      await this.createConsumerGroups();

      this.state = ProcessorState.READY;
      console.log("[QueueProcessor] ✓ Initialized successfully");
    } catch (error) {
      this.state = ProcessorState.ERROR;
      console.error("[QueueProcessor] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Cria consumer groups para todos os eventos registrados
   */
  private async createConsumerGroups(): Promise<void> {
    console.log(`[QueueProcessor] Creating consumer groups for ${this.handlers.size} event types...`);

    for (const eventName of this.handlers.keys()) {
      const streamKey = `events:${eventName}`;

      try {
        // Tentar criar o consumer group
        // "0" = processar desde o início (mensagens antigas também)
        await this.redis.xgroup(
          "CREATE",
          streamKey,
          this.consumerGroup,
          "0",
          "MKSTREAM"
        );
        console.log(`[QueueProcessor]   ✓ Created consumer group for ${streamKey}`);
      } catch (error: any) {
        // BUSYGROUP = grupo já existe, está tudo bem
        if (error.message.includes("BUSYGROUP")) {
          console.log(`[QueueProcessor]   ✓ Consumer group already exists for ${streamKey}`);
        } else {
          console.error(`[QueueProcessor]   ✗ Error creating consumer group for ${streamKey}:`, error);
          throw error;
        }
      }
    }

    console.log("[QueueProcessor] ✓ All consumer groups ready");
  }

  /**
   * Inicia o processamento de eventos
   */
  async start(): Promise<void> {
    if (this.state !== ProcessorState.READY) {
      throw new Error(`[QueueProcessor] Cannot start from state: ${this.state}. Call initialize() first.`);
    }

    this.shouldRun = true;
    this.state = ProcessorState.RUNNING;
    console.log("[QueueProcessor] Starting event processing...");

    // Iniciar o loop de processamento (não-bloqueante)
    this.processingLoop = this.processMessages();

    console.log("[QueueProcessor] ✓ Event processing started");
  }

  /**
   * Para o processamento de eventos
   */
  async stop(): Promise<void> {
    if (this.state === ProcessorState.STOPPED || this.state === ProcessorState.STOPPING) {
      console.log("[QueueProcessor] Already stopped or stopping");
      return;
    }

    console.log("[QueueProcessor] Stopping...");
    this.state = ProcessorState.STOPPING;
    this.shouldRun = false;

    // Aguardar o loop de processamento terminar
    if (this.processingLoop) {
      await this.processingLoop;
    }

    // Fechar conexão Redis
    await this.redis.quit();

    this.state = ProcessorState.STOPPED;
    console.log("[QueueProcessor] ✓ Stopped");
  }

  /**
   * Loop principal de processamento
   */
  private async processMessages(): Promise<void> {
    console.log("[QueueProcessor] Processing loop started");

    while (this.shouldRun) {
      try {
        // Processar cada tipo de evento
        for (const eventName of this.handlers.keys()) {
          if (!this.shouldRun) break;

          const streamKey = `events:${eventName}`;

          // 1) Processar mensagens PENDENTES (não ACKadas) primeiro
          try {
            const pending = await this.redis.xreadgroup(
              "GROUP",
              this.consumerGroup,
              this.consumerName,
              "COUNT",
              "10",
              "STREAMS",
              streamKey,
              "0" // "0" = mensagens pendentes
            );

            if (pending) {
              await this.processBatch(eventName, pending, streamKey);
            }
          } catch (error) {
            console.error(`[QueueProcessor] Error reading pending messages from ${streamKey}:`, error);
          }

          if (!this.shouldRun) break;

          // 2) Processar mensagens NOVAS
          try {
            const fresh = await this.redis.xreadgroup(
              "GROUP",
              this.consumerGroup,
              this.consumerName,
              "COUNT",
              "10",
              "BLOCK",
              "1000", // Bloquear por 1 segundo esperando novas mensagens
              "STREAMS",
              streamKey,
              ">" // ">" = apenas mensagens novas
            );

            if (fresh) {
              await this.processBatch(eventName, fresh, streamKey);
            }
          } catch (error) {
            console.error(`[QueueProcessor] Error reading fresh messages from ${streamKey}:`, error);
          }
        }
      } catch (error) {
        console.error("[QueueProcessor] Error in processing loop:", error);
        // Pequeno delay antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("[QueueProcessor] Processing loop ended");
  }

  /**
   * Processa um lote de mensagens
   */
  private async processBatch(eventName: string, results: any[], streamKey: string): Promise<void> {
    for (const [, messages] of results) {
      for (const [messageId, fields] of messages) {
        await this.handleMessage(eventName, messageId, fields, streamKey);
      }
    }
  }

  /**
   * Processa uma mensagem individual
   */
  private async handleMessage(
    eventName: string,
    messageId: string,
    fields: string[],
    streamKey: string
  ): Promise<void> {
    try {
      // Redis streams retorna fields como array [key, value, key, value, ...]
      const fieldData: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        fieldData[fields[i]] = fields[i + 1];
      }

      // Reconstruir o evento
      const event = {
        id: fieldData.id,
        type: fieldData.type,
        version: fieldData.version,
        source: fieldData.source,
        timestamp: new Date(fieldData.timestamp),
        data: JSON.parse(fieldData.data || "{}"),
        correlationId: fieldData.correlationId,
        causationId: fieldData.causationId,
        metadata: fieldData.metadata ? JSON.parse(fieldData.metadata) : undefined,
      };

      // Executar todos os handlers registrados para este evento
      const handlers = this.handlers.get(eventName) || [];

      for (const handler of handlers) {
        try {
          await handler.handle(event as any);
          console.log(`[QueueProcessor] ✓ Handled ${eventName} (message ID: ${messageId})`);
        } catch (handlerError) {
          console.error(
            `[QueueProcessor] ✗ Error in handler for ${eventName}:`,
            handlerError
          );
          // Continua processando outros handlers mesmo se um falhar
        }
      }

      // Confirmar processamento (ACK)
      await this.redis.xack(streamKey, this.consumerGroup, messageId);
    } catch (error) {
      console.error(`[QueueProcessor] Error handling message ${messageId}:`, error);
      // TODO: Implementar Dead Letter Queue para mensagens com erro
    }
  }

  /**
   * Retorna o estado atual do processador
   */
  getState(): ProcessorState {
    return this.state;
  }

  /**
   * Verifica se o processador está rodando
   */
  isRunning(): boolean {
    return this.state === ProcessorState.RUNNING;
  }

  /**
   * Retorna quantidade de handlers registrados
   */
  getHandlerCount(): number {
    let count = 0;
    for (const handlers of this.handlers.values()) {
      count += handlers.length;
    }
    return count;
  }

  /**
   * Retorna lista de eventos registrados
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}
