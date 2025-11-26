import type { IEventBus } from '@core/bus/i-event-bus'
import { RedisEventBus } from '@core/infra/clients/redis-event-bus'

let eventBusInstance: IEventBus | null = null

/**
 * Factory to create the Event Bus instance (Singleton)
 *
 * Currently uses Redis Streams for event publishing.
 * Can be extended to support SQS, EventBridge, etc.
 */
export function makeEventBus(): IEventBus {
  if (eventBusInstance) {
    return eventBusInstance
  }

  eventBusInstance = new RedisEventBus()

  if (process.env.NODE_ENV !== 'test') {
    console.log('[EventBus] Using Redis Streams')
  }

  return eventBusInstance
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetEventBus(): void {
  eventBusInstance = null
}