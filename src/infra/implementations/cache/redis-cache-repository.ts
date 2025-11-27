import { ICacheRepository } from "@core/contracts/cache/i-cache-repository";
import { Redis } from "@upstash/redis";

export class RedisCacheRepository implements ICacheRepository {
  private static instance: RedisCacheRepository;
  private static client: Redis;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Get singleton instance (Lambda-friendly for connection reuse)
   */
  public static getInstance(): RedisCacheRepository {
    console.log('[Redis] getInstance called');
    if (!RedisCacheRepository.instance) {
      console.log('[Redis] Creating new instance (first time)');
      RedisCacheRepository.instance = new RedisCacheRepository();
      RedisCacheRepository.initializeClient();
    } else {
      console.log('[Redis] Reusing existing instance');
    }
    return RedisCacheRepository.instance;
  }

  private static initializeClient(): void {
    if (!RedisCacheRepository.client) {
      console.log('[Redis] Initializing Upstash Redis client...');
      console.log('[Redis] UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '***configured***' : 'NOT SET');
      console.log('[Redis] UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? '***configured***' : 'NOT SET');

      RedisCacheRepository.client = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      console.log('[Redis] Upstash client instance created');
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    console.log(`[Redis] GET operation started for key: ${key}`);

    try {
      console.log(`[Redis] Executing GET command...`);
      const value = await RedisCacheRepository.client.get<T>(key);

      if (!value) {
        console.log(`[Redis] GET - Key not found: ${key}`);
        return null;
      }

      console.log(`[Redis] GET - Value found for key: ${key}`);
      console.log(`[Redis] GET - Successfully retrieved value`);
      return value;
    } catch (error) {
      console.error(`[Redis] GET - Failed to get key ${key}:`, error);
      throw error;
    }
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    console.log(`[Redis] SET operation started for key: ${key}`);
    console.log(`[Redis] SET - TTL: ${ttl ? `${ttl}s` : 'none'}`);
    console.log(`[Redis] SET - Value type: ${typeof value}`);

    try {
      if (ttl) {
        console.log(`[Redis] SET - Executing SET command with EX option (TTL ${ttl}s)...`);
        await RedisCacheRepository.client.set(key, value, { ex: ttl });
      } else {
        console.log(`[Redis] SET - Executing SET command (no TTL)...`);
        await RedisCacheRepository.client.set(key, value);
      }

      console.log(`[Redis] SET - Operation completed successfully for key: ${key}`);

      // Verify the value was actually set
      console.log(`[Redis] SET - Verifying value was stored...`);
      const exists = await RedisCacheRepository.client.exists(key);
      console.log(`[Redis] SET - Verification: key exists = ${exists === 1}`);

      if (ttl) {
        const actualTTL = await RedisCacheRepository.client.ttl(key);
        console.log(`[Redis] SET - Actual TTL set: ${actualTTL}s`);
      }
    } catch (error) {
      console.error(`[Redis] SET - Failed to set key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    console.log(`[Redis] DEL operation started for key: ${key}`);
    try {
      await RedisCacheRepository.client.del(key);
      console.log(`[Redis] DEL - Key deleted: ${key}`);
    } catch (error) {
      console.error(`[Redis] DEL - Failed to delete key ${key}:`, error);
      throw error;
    }
  }

  async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    console.log(`[Redis] DEL MANY operation started for ${keys.length} keys`);
    try {
      await RedisCacheRepository.client.del(...keys);
      console.log(`[Redis] DEL MANY - Keys deleted: ${keys.length}`);
    } catch (error) {
      console.error(`[Redis] DEL MANY - Failed to delete keys:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    console.log(`[Redis] EXISTS operation started for key: ${key}`);
    try {
      const result = await RedisCacheRepository.client.exists(key);
      console.log(`[Redis] EXISTS - Key ${key} exists: ${result === 1}`);
      return result === 1;
    } catch (error) {
      console.error(`[Redis] EXISTS - Failed to check key ${key}:`, error);
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    console.log(`[Redis] KEYS operation started with pattern: ${pattern}`);
    try {
      const result = await RedisCacheRepository.client.keys(pattern);
      console.log(`[Redis] KEYS - Found ${result.length} keys`);
      return result;
    } catch (error) {
      console.error(`[Redis] KEYS - Failed with pattern ${pattern}:`, error);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    console.log(`[Redis] TTL operation started for key: ${key}`);
    try {
      const result = await RedisCacheRepository.client.ttl(key);
      console.log(`[Redis] TTL - Key ${key} has TTL: ${result}s`);
      return result;
    } catch (error) {
      console.error(`[Redis] TTL - Failed to get TTL for key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    console.log(`[Redis] EXPIRE operation started for key: ${key}, seconds: ${seconds}`);
    try {
      const result = await RedisCacheRepository.client.expire(key, seconds);
      console.log(`[Redis] EXPIRE - Key ${key} expiration set: ${result}`);
      return result === 1;
    } catch (error) {
      console.error(`[Redis] EXPIRE - Failed to set expiration for key ${key}:`, error);
      throw error;
    }
  }

  async mget<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) {
      return [];
    }

    console.log(`[Redis] MGET operation started for ${keys.length} keys`);
    try {
      const values = await RedisCacheRepository.client.mget(...keys) as (T | null)[];
      console.log(`[Redis] MGET - Retrieved ${values.length} values`);
      return values;
    } catch (error) {
      console.error(`[Redis] MGET - Failed to get multiple keys:`, error);
      throw error;
    }
  }

  async mset(entries: Array<{ key: string; value: unknown }>): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    console.log(`[Redis] MSET operation started for ${entries.length} entries`);
    try {
      // Upstash Redis mset expects an object with key-value pairs
      const kvPairs: Record<string, unknown> = {};
      for (const entry of entries) {
        kvPairs[entry.key] = entry.value;
      }

      await RedisCacheRepository.client.mset(kvPairs);
      console.log(`[Redis] MSET - Set ${entries.length} key-value pairs`);
    } catch (error) {
      console.error(`[Redis] MSET - Failed to set multiple keys:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.log('[Redis] Disconnect called (Upstash uses HTTP, no persistent connection)');
    // Upstash Redis uses HTTP REST API, no need to disconnect
    // This method is kept for interface compatibility
  }

  async flushAll(): Promise<void> {
    console.log('[Redis] FLUSHALL operation started');
    try {
      await RedisCacheRepository.client.flushall();
      console.log('[Redis] FLUSHALL - All keys deleted');
    } catch (error) {
      console.error('[Redis] FLUSHALL - Failed to flush all keys:', error);
      throw error;
    }
  }

  async ping(): Promise<string> {
    console.log('[Redis] PING operation started');
    try {
      const result = await RedisCacheRepository.client.ping();
      console.log('[Redis] PING - Response:', result);
      return result;
    } catch (error) {
      console.error('[Redis] PING - Failed:', error);
      throw error;
    }
  }
}
