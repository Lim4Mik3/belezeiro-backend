import Redis from "ioredis";
import { BaseDomainEvent } from "@core/domain/events/base-domain-event";

export type EventHandler<T extends BaseDomainEvent = BaseDomainEvent> = {
  eventName: string;
  handle: (event: T) => Promise<void>;
};

export class RedisQueueProcessor {
  private redis: Redis;
  private handlers: Map<string, EventHandler[]> = new Map();
  private isRunning = false;
  private consumerGroup = "belezeiro-server";
  private consumerName = `consumer-${process.pid}`;

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || "redis://localhost:6379");
  }

  registerHandler(handler: EventHandler) {
    const handlers = this.handlers.get(handler.eventName) || [];
    handlers.push(handler);
    this.handlers.set(handler.eventName, handlers);
    console.log(`[QueueProcessor] Registered handler for event: ${handler.eventName}`);
  }

  async start() {
    if (this.isRunning) {
      console.log("[QueueProcessor] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[QueueProcessor] Starting queue processor...");

    // Criar consumer groups para cada stream que temos handlers
    for (const eventName of this.handlers.keys()) {
      const streamKey = `events:${eventName}`;

      try {
        // Tentar criar o consumer group (ignora erro se já existir)
        // "0" = ler desde o início do stream (processar mensagens antigas também)
        await this.redis.xgroup(
          "CREATE",
          streamKey,
          this.consumerGroup,
          "0",
          "MKSTREAM"
        );
        console.log(`[QueueProcessor] Created consumer group for ${streamKey}`);
      } catch (error: any) {
        if (!error.message.includes("BUSYGROUP")) {
          console.error(`[QueueProcessor] Error creating consumer group for ${streamKey}:`, error);
        } else {
          console.log(`[QueueProcessor] Consumer group already exists for ${streamKey}`);
        }
      }
    }

    // Iniciar processamento
    this.processMessages();
  }

  async stop() {
    this.isRunning = false;
    await this.redis.quit();
    console.log("[QueueProcessor] Stopped");
  }

  private async processMessages() {
    while (this.isRunning) {
      try {
        for (const eventName of this.handlers.keys()) {
          const streamKey = `events:${eventName}`;

          // 1) Ler mensagens PENDENTES (não ACKadas)
          const pending = await this.redis.xreadgroup(
            "GROUP",
            this.consumerGroup,
            this.consumerName,
            "COUNT",
            "10",
            "STREAMS",
            streamKey,
            "0"
          );

          if (pending) {
            await this.processBatch(eventName, pending, streamKey);
          }

          // 2) Ler mensagens NOVAS
          const fresh = await this.redis.xreadgroup(
            "GROUP",
            this.consumerGroup,
            this.consumerName,
            "COUNT",
            "10",
            "BLOCK",
            "1000",
            "STREAMS",
            streamKey,
            ">"
          );

          if (fresh) {
            await this.processBatch(eventName, fresh, streamKey);
          }
        }
      } catch (err) {
        console.error("[QueueProcessor] Error processing messages:", err);
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  private async processBatch(eventName: string, results: any[], streamKey: string) {
    for (const [, messages] of results) {
      for (const [messageId, fields] of messages) {
        await this.handleMessage(eventName, messageId, fields, streamKey);
      }
    }
  }


  private async handleMessage(
    eventName: string,
    messageId: string,
    fields: string[],
    streamKey: string
  ) {
    try {
      // Redis streams retorna fields como array [key, value, key, value, ...]
      const fieldData: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        fieldData[fields[i]] = fields[i + 1];
      }

      // Reconstruct the full event object
      const event = {
        id: fieldData.id,
        type: fieldData.type,
        version: fieldData.version,
        source: fieldData.source,
        timestamp: new Date(fieldData.timestamp),
        data: JSON.parse(fieldData.data || "{}"),
        correlationId: fieldData.correlationId,
        causationId: fieldData.causationId,
        metadata: fieldData.metadata ? JSON.parse(fieldData.metadata) : undefined
      };

      // Executar todos os handlers registrados para este evento
      const handlers = this.handlers.get(eventName) || [];

      for (const handler of handlers) {
        try {
          await handler.handle(event as any);
          console.log(`[QueueProcessor] Successfully handled ${eventName} with ${handler.constructor.name}`);
        } catch (handlerError) {
          console.error(
            `[QueueProcessor] Error in handler ${handler.constructor.name} for ${eventName}:`,
            handlerError
          );
          // Continua processando outros handlers mesmo se um falhar
        }
      }

      // Confirmar processamento da mensagem (ACK)
      await this.redis.xack(streamKey, this.consumerGroup, messageId);
    } catch (error) {
      console.error(`[QueueProcessor] Error handling message ${messageId}:`, error);
      // Em produção, você pode querer implementar dead letter queue aqui
    }
  }

  getHandlerCount(): number {
    let count = 0;
    for (const handlers of this.handlers.values()) {
      count += handlers.length;
    }
    return count;
  }

  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}
