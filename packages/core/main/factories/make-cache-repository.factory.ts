import type { ICacheRepository } from '@core/app/contracts/i-cache-repository'
import { IORedisCacheRepository } from '@core/infra/repositories/io-redis-cache-repository'
import { UpstashCacheRepository } from '@core/infra/repositories/upstash-cache-repository';

let cacheRepositoryInstance: ICacheRepository | null = null

export function makeCacheRepository(): ICacheRepository {
  if (cacheRepositoryInstance) {
    return cacheRepositoryInstance
  }

  cacheRepositoryInstance = new UpstashCacheRepository();

  return cacheRepositoryInstance
}

export function resetCacheRepository(): void {
  cacheRepositoryInstance = null
}