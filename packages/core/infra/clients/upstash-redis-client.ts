import { Redis } from '@upstash/redis'
import { envGlobal } from '../config/env-global';

export const upstashRedis = new Redis({
  url: envGlobal.UPSTASH_REDIS_REST_URL,
  token: envGlobal.UPSTASH_REDIS_REST_TOKEN,
});