import Redis from 'ioredis'
import { envGlobal } from '../config/env-global'

export class RedisClient {
  private readonly client: Redis

  constructor() {
    this.client = new Redis({
      host: envGlobal.REDIS_HOST,
      port: envGlobal.REDIS_PORT,
      maxRetriesPerRequest: 3,
      enableAutoPipelining: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.client.on('ready', () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log('[Redis] Connected')
      }
    })

    this.client.on('error', (error) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[Redis] Error:', error.message)
      }
    })
  }

  getClient(): Redis {
    return this.client
  }

  isReady(): boolean {
    return this.client.status === 'ready'
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit()
    } catch {
      this.client.disconnect()
    }
  }
}

export const IORedisClient = new RedisClient()
