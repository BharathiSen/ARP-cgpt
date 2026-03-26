import { redisClient } from '@/lib/redis';
import { incrementMetric } from '@/lib/telemetry';

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const WINDOW_MS = 60_000;
const FREE_LIMIT = 10;
const PRO_LIMIT = 100;

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function computeWindowReset(now: number) {
  return Math.floor(now / WINDOW_MS) * WINDOW_MS + WINDOW_MS;
}

function buildRateLimitKey(identifier: string, isPaid: boolean, now: number) {
  const window = Math.floor(now / WINDOW_MS);
  const tier = isPaid ? 'pro' : 'free';
  return `rl:v1:${tier}:${identifier}:${window}`;
}

function enforceInMemoryLimit(identifier: string, isPaid: boolean): LimitResult {
  const now = Date.now();
  const limit = isPaid ? PRO_LIMIT : FREE_LIMIT;
  const key = buildRateLimitKey(identifier, isPaid, now);
  const reset = computeWindowReset(now);

  const existing = memoryBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: reset });
    return { success: true, limit, remaining: Math.max(0, limit - 1), reset };
  }

  existing.count += 1;
  memoryBuckets.set(key, existing);

  return {
    success: existing.count <= limit,
    limit,
    remaining: Math.max(0, limit - existing.count),
    reset,
  };
}

export async function checkRateLimit(identifier: string, isPaid: boolean = false): Promise<LimitResult> {
  await incrementMetric('rate_limit_requests');

  if (!identifier) {
    await incrementMetric('rate_limit_blocked');
    return { success: false, limit: FREE_LIMIT, remaining: 0, reset: Date.now() + WINDOW_MS };
  }

  const now = Date.now();
  const limit = isPaid ? PRO_LIMIT : FREE_LIMIT;
  const reset = computeWindowReset(now);

  if (!redisClient.isAvailable) {
    console.warn('Redis unavailable, applying in-memory fallback rate limit');
    const result = enforceInMemoryLimit(identifier, isPaid);
    if (!result.success) {
      await incrementMetric('rate_limit_blocked');
    }
    return result;
  }

  try {
    const key = buildRateLimitKey(identifier, isPaid, now);
    const currentCount = await redisClient.incr(key);
    if (currentCount === 1) {
      await redisClient.expire(key, Math.ceil(WINDOW_MS / 1000) + 2);
    }

    const result = {
      success: currentCount <= limit,
      limit,
      remaining: Math.max(0, limit - currentCount),
      reset,
    };
    if (!result.success) {
      await incrementMetric('rate_limit_blocked');
    }
    return result;
  } catch (error) {
    console.error('Rate limiting failed, using in-memory fallback:', error);
    const result = enforceInMemoryLimit(identifier, isPaid);
    if (!result.success) {
      await incrementMetric('rate_limit_blocked');
    }
    return result;
  }
}
