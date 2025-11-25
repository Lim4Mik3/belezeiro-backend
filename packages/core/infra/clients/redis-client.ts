import Redis from "ioredis";
import { envGlobal } from "../config/env-global";

export enum RedisStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  READY = 'ready',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}

export class RedisClient {
  private client: Redis
  private currentStatus: RedisStatus = RedisStatus.CONNECTING
  private connectionAttempts = 0
  private lastError: Error | null = null

  constructor() {
    this.client = new Redis({
      host: envGlobal.REDIS_HOST,
      port: envGlobal.REDIS_PORT,
      maxRetriesPerRequest: 3,
      enableAutoPipelining: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        console.log(
          `[Redis] Retry attempt ${times}, waiting ${delay}ms before reconnecting...`,
        )
        return delay
      },
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.connectionAttempts++
      this.currentStatus = RedisStatus.CONNECTING
      console.log(
        `[Redis] Connecting to ${envGlobal.REDIS_HOST}:${envGlobal.REDIS_PORT}...`,
      )
    })

    this.client.on('ready', () => {
      this.currentStatus = RedisStatus.READY
      console.log(
        `[Redis] Connected and ready! (attempt ${this.connectionAttempts})`,
      )
      this.lastError = null
    })

    this.client.on('error', (error) => {
      this.currentStatus = RedisStatus.ERROR
      this.lastError = error
      console.error('[Redis] Connection error:', error.message)
    })

    this.client.on('close', () => {
      this.currentStatus = RedisStatus.DISCONNECTED
      console.warn('[Redis] Connection closed')
    })

    this.client.on('reconnecting', (delay: number) => {
      this.currentStatus = RedisStatus.RECONNECTING
      console.log(`[Redis] Reconnecting in ${delay}ms...`)
    })

    this.client.on('end', () => {
      this.currentStatus = RedisStatus.DISCONNECTED
      console.warn('[Redis] Connection ended')
    })
  }

  getClient(): Redis {
    return this.client
  }

  getStatus(): RedisStatus {
    return this.currentStatus
  }

  getLastError(): Error | null {
    return this.lastError
  }

  getConnectionAttempts(): number {
    return this.connectionAttempts
  }

  isReady(): boolean {
    return this.currentStatus === RedisStatus.READY
  }

  async healthCheck(): Promise<{
    status: RedisStatus
    isHealthy: boolean
    latencyMs: number | null
    error: string | null
  }> {
    try {
      const start = Date.now()
      await this.client.ping()
      const latencyMs = Date.now() - start

      return {
        status: this.currentStatus,
        isHealthy: true,
        latencyMs,
        error: null,
      }
    } catch (error) {
      return {
        status: this.currentStatus,
        isHealthy: false,
        latencyMs: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async disconnect(): Promise<void> {
    console.log('[Redis] Disconnecting...')
    await this.client.quit()
  }
}

export const redisClient = new RedisClient()
export const redis = redisClient.getClient()
