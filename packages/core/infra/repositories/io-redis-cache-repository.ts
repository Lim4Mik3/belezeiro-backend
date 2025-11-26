import type { ICacheRepository } from '@core/app/contracts/i-cache-repository'
import { IORedisClient } from '../clients/redis-client'

export class IORedisCacheRepository implements ICacheRepository {
  private readonly client = IORedisClient.getClient()

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)

      if (!value) {
        return null
      }

      return JSON.parse(value) as T
    } catch (error) {
      console.error(`[IORedisCacheRepository] Error getting key ${key}:`, error)
      throw error
    }
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)

      if (ttl) {
        await this.client.setex(key, ttl, serialized)
      } else {
        await this.client.set(key, serialized)
      }
    } catch (error) {
      console.error(`[IORedisCacheRepository] Error setting key ${key}:`, error)
      throw error
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      console.error(`[IORedisCacheRepository] Error deleting key ${key}:`, error)
      throw error
    }
  }

  async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return

    try {
      await this.client.del(...keys)
    } catch (error) {
      console.error(`[IORedisCacheRepository] Error deleting keys:`, error)
      throw error
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error(`[IORedisCacheRepository] Error checking existence of key ${key}:`, error)
      throw error
    }
  }
}
