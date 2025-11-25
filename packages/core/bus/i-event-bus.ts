/**
 * Domain Event with envelope pattern
 * Supports multiple message brokers (SQS, EventBridge, Redis, Kafka, RabbitMQ)
 */
export interface IDomainEvent<T = any> {
  // Identificação única
  id: string;                    // UUID do evento
  type: string;                  // Ex: "iam.user.authenticated.v1"
  version: string;               // Versionamento do schema (ex: "1.0.0")

  // Rastreamento distribuído
  correlationId?: string;        // Para rastrear fluxo completo (jornada do usuário)
  causationId?: string;          // ID do evento que causou este evento

  // Timestamp
  timestamp: Date;               // Quando o evento foi criado

  // Contexto de origem
  source: string;                // Bounded context (ex: "iam-service", "orders-service")

  // Dados do evento
  data: T;                       // Payload tipado e específico

  // Metadados opcionais (broker-specific)
  metadata?: Record<string, any>; // Para SQS MessageGroupId, EventBridge custom fields, etc
}

export interface IEventBus {
  /**
   * Publica um único evento
   */
  publish(event: IDomainEvent): Promise<void>;

  /**
   * Publica múltiplos eventos em batch (mais eficiente)
   */
  publishBatch(events: IDomainEvent[]): Promise<void>;
}