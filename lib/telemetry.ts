import { redisClient } from '@/lib/redis';

type MetricName = 'cache_hits' | 'cache_misses' | 'rate_limit_requests' | 'rate_limit_blocked';

const metricKeys: Record<MetricName, string> = {
  cache_hits: 'telemetry:v1:cache_hits',
  cache_misses: 'telemetry:v1:cache_misses',
  rate_limit_requests: 'telemetry:v1:rate_limit_requests',
  rate_limit_blocked: 'telemetry:v1:rate_limit_blocked',
};

const memoryCounters: Record<MetricName, number> = {
  cache_hits: 0,
  cache_misses: 0,
  rate_limit_requests: 0,
  rate_limit_blocked: 0,
};

export async function incrementMetric(metric: MetricName, amount: number = 1): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) return;

  if (!redisClient.isAvailable) {
    memoryCounters[metric] += amount;
    return;
  }

  try {
    const key = metricKeys[metric];
    for (let i = 0; i < amount; i += 1) {
      await redisClient.incr(key);
    }
  } catch {
    memoryCounters[metric] += amount;
  }
}

export async function getMetric(metric: MetricName): Promise<number> {
  if (!redisClient.isAvailable) {
    return memoryCounters[metric];
  }

  try {
    const value = await redisClient.get<string | number>(metricKeys[metric]);
    if (value === null || value === undefined) return memoryCounters[metric];
    if (typeof value === 'number') return value;

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : memoryCounters[metric];
  } catch {
    return memoryCounters[metric];
  }
}

export async function getTelemetrySnapshot() {
  const [cacheHits, cacheMisses, rateLimitRequests, rateLimitBlocked] = await Promise.all([
    getMetric('cache_hits'),
    getMetric('cache_misses'),
    getMetric('rate_limit_requests'),
    getMetric('rate_limit_blocked'),
  ]);

  const totalCacheLookups = cacheHits + cacheMisses;
  const cacheHitRate = totalCacheLookups > 0 ? Number(((cacheHits / totalCacheLookups) * 100).toFixed(2)) : 0;

  return {
    cache_hits: cacheHits,
    cache_misses: cacheMisses,
    cache_hit_rate: cacheHitRate,
    rate_limit_requests: rateLimitRequests,
    rate_limit_blocked: rateLimitBlocked,
  };
}
