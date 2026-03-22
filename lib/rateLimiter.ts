import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasRedisConfig = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = hasRedisConfig ? Redis.fromEnv() : null;

const freeLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
}) : null;

const proLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
}) : null;

export async function checkRateLimit(identifier: string, isPaid: boolean = false) {
  if (!redis || !freeLimiter || !proLimiter) {
    console.warn('⚠️ Upstash Redis not configured, bypassing rate limits temporarily');
    return { success: true, limit: isPaid ? 100 : 10, remaining: 99, reset: Date.now() + 60000 };
  }

  try {
    const limiter = isPaid ? proLimiter : freeLimiter;
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { success: true, limit: 100, remaining: 1, reset: Date.now() + 60000 };
  }
}

