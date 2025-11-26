import type { IDomainEvent, IEventBus } from '@core/bus/i-event-bus'
import { IORedisClient } from './redis-client'

/**
 * Redis Event Bus (ioredis implementation)
 *
 * Publishes domain events to Redis Streams
 */
export class RedisEventBus implements IEventBus {
  private readonly client = IORedisClient.getClient()

  async publish(event: IDomainEvent): Promise<void> {
    const streamName = `events:${event.type}`

    try {
      const messageId = await this.client.xadd(
        streamName,
        '*', // Auto-generate message ID
        'id', event.id,
        'type', event.type,
        'version', event.version,
        'source', event.source,
        'timestamp', event.timestamp.toISOString(),
        'data', JSON.stringify(event.data),
        ...(event.correlationId ? ['correlationId', event.correlationId] : []),
        ...(event.causationId ? ['causationId', event.causationId] : []),
        ...(event.metadata ? ['metadata', JSON.stringify(event.metadata)] : []),
      )

      if (process.env.NODE_ENV !== 'test') {
        console.log(`[RedisEventBus] Published ${event.type} [${messageId}]`)
      }
    } catch (error) {
      console.error(`[RedisEventBus] Error publishing ${event.type}:`, error)
      throw error
    }
  }

  async publishBatch(events: IDomainEvent[]): Promise<void> {
    if (events.length === 0) return

    const pipeline = this.client.pipeline()

    for (const event of events) {
      const streamName = `events:${event.type}`

      pipeline.xadd(
        streamName,
        '*',
        'id', event.id,
        'type', event.type,
        'version', event.version,
        'source', event.source,
        'timestamp', event.timestamp.toISOString(),
        'data', JSON.stringify(event.data),
        ...(event.correlationId ? ['correlationId', event.correlationId] : []),
        ...(event.causationId ? ['causationId', event.causationId] : []),
        ...(event.metadata ? ['metadata', JSON.stringify(event.metadata)] : []),
      )
    }

    try {
      await pipeline.exec()

      if (process.env.NODE_ENV !== 'test') {
        console.log(`[RedisEventBus] Published batch of ${events.length} events`)
      }
    } catch (error) {
      console.error(`[RedisEventBus] Error publishing batch:`, error)
      throw error
    }
  }
}
