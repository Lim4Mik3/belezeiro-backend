import { ICacheRepository } from "@core/contracts/cache/i-cache-repository";
import { RedisCacheRepository } from "@infra/implementations/cache/redis-cache-repository";

export function makeCacheRepository(): ICacheRepository {
  return RedisCacheRepository.getInstance();
}
