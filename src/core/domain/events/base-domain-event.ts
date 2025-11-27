import { randomUUID } from "crypto";
import { IDomainEvent } from "@core/contracts/event-bus/i-event-bus";
import { DomainEventType, EventSource } from "./event-registry";

/**
 * Base class for all domain events
 * Handles common event envelope fields automatically
 */
export abstract class BaseDomainEvent<T = any> implements IDomainEvent<T> {
  readonly id: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly metadata?: Record<string, any>;

  constructor(
    readonly type: DomainEventType,
    readonly version: string,
    readonly source: EventSource,
    readonly data: T,
    options?: {
      correlationId?: string;
      causationId?: string;
      metadata?: Record<string, any>;
    }
  ) {
    this.id = randomUUID();
    this.timestamp = new Date();
    this.correlationId = options?.correlationId;
    this.causationId = options?.causationId;
    this.metadata = options?.metadata;
  }

  /**
   * Serializes the event to JSON
   * Useful for logging and debugging
   */
  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      version: this.version,
      source: this.source,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      causationId: this.causationId,
      data: this.data,
      metadata: this.metadata,
    };
  }
}
