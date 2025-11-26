export interface ICacheRepository {
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns The cached value or null if not found
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  del(key: string): Promise<void>;

  /**
   * Delete multiple values from cache
   * @param keys Cache keys
   */
  delMany(keys: string[]): Promise<void>;

  /**
   * Check if a key exists in cache
   * @param key Cache key
   */
  exists(key: string): Promise<boolean>;
}
