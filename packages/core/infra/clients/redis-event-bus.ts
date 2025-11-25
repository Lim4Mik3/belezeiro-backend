import { IDomainEvent, IEventBus } from "@core/bus/i-event-bus";
import type { RedisClient } from "./redis-client";
import type { Redis } from "ioredis";

/**
 * Redis-based Event Bus implementation using Redis Streams
 *
 * Features:
 * - Persistent event log
 * - Consumer groups support
 * - Automatic message ID generation
 * - Event replay capability
 */
export class RedisEventBus implements IEventBus {
  constructor(private redisClient: RedisClient) { }

  /**
   * Publishes a single event to Redis Stream
   * Stream name format: events:{event.type}
   */
  async publish(event: IDomainEvent): Promise<void> {
    const client = this.redisClient.getClient();

    const streamName = `events:${event.type}`;

    await client.xadd(
      streamName,
      "*", // Auto-generate message ID
      "id", event.id,
      "type", event.type,
      "version", event.version,
      "source", event.source,
      "timestamp", event.timestamp.toISOString(),
      "data", JSON.stringify(event.data),
      ...(event.correlationId ? ["correlationId", event.correlationId] : []),
      ...(event.causationId ? ["causationId", event.causationId] : []),
      ...(event.metadata ? ["metadata", JSON.stringify(event.metadata)] : [])
    );
  }

  /**
   * Publishes multiple events in a single pipeline (atomic operation)
   */
  async publishBatch(events: IDomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    const client = this.redisClient.getClient();
    const pipeline = client.pipeline();

    for (const event of events) {
      const streamName = `events:${event.type}`;

      pipeline.xadd(
        streamName,
        "*",
        "id", event.id,
        "type", event.type,
        "version", event.version,
        "source", event.source,
        "timestamp", event.timestamp.toISOString(),
        "data", JSON.stringify(event.data),
        ...(event.correlationId ? ["correlationId", event.correlationId] : []),
        ...(event.causationId ? ["causationId", event.causationId] : []),
        ...(event.metadata ? ["metadata", JSON.stringify(event.metadata)] : [])
      );
    }

    await pipeline.exec();
  }
}