import { ICacheRepository } from "@core/contracts/cache/i-cache-repository";
import { createClient, RedisClientType } from "@redis/client";

export class RedisCacheRepository implements ICacheRepository {
  private static instance: RedisCacheRepository;
  private static client: RedisClientType;
  private static isConnected = false;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Get singleton instance (Lambda-friendly for connection reuse)
   */
  public static getInstance(): RedisCacheRepository {
    if (!RedisCacheRepository.instance) {
      RedisCacheRepository.instance = new RedisCacheRepository();
      RedisCacheRepository.initializeClient();
    }
    return RedisCacheRepository.instance;
  }

  private static initializeClient(): void {
    if (!RedisCacheRepository.client) {
      RedisCacheRepository.client = createClient({
        url: process.env.REDIS_URL,
      });

      RedisCacheRepository.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        RedisCacheRepository.isConnected = false;
      });

      RedisCacheRepository.client.on("connect", () => {
        console.log("Redis connected successfully");
        RedisCacheRepository.isConnected = true;
      });
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!RedisCacheRepository.isConnected) {
      await RedisCacheRepository.client.connect();
      RedisCacheRepository.isConnected = true;
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    await this.ensureConnection();

    const value = await RedisCacheRepository.client.get(key);

    if (!value) {
      return null;
    }

    // Se já for um objeto, retorna direto
    if (typeof value === "object") {
      return value as T;
    }

    // Se for string, tenta fazer parse
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as T;
      } catch {
        // Se falhar o parse, retorna a string como está
        return value as T;
      }
    }

    // Para qualquer outro tipo primitivo, retorna como está
    return value as T;
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    await this.ensureConnection();

    const serializedValue = JSON.stringify(value);

    if (ttl) {
      await RedisCacheRepository.client.setEx(key, ttl, serializedValue);
    } else {
      await RedisCacheRepository.client.set(key, serializedValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.ensureConnection();
    await RedisCacheRepository.client.del(key);
  }

  async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    await this.ensureConnection();
    await RedisCacheRepository.client.del(keys);
  }

  async exists(key: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await RedisCacheRepository.client.exists(key);
    return result === 1;
  }

  async disconnect(): Promise<void> {
    if (RedisCacheRepository.isConnected) {
      await RedisCacheRepository.client.quit();
      RedisCacheRepository.isConnected = false;
    }
  }
}