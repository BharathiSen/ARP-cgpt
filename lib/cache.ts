import { redisClient } from '@/lib/redis';
import { incrementMetric } from '@/lib/telemetry';

export async function getCachedOrFetch<T>(
  key: string,
  fetchData: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  if (!redisClient.isAvailable) {
    await incrementMetric('cache_misses');
    return fetchData();
  }

  try {
    const cached = await redisClient.get<T>(key);
    if (cached !== null) {
      console.log(`Redis Cache Hit: ${key}`);
      await incrementMetric('cache_hits');
      return cached;
    }
    await incrementMetric('cache_misses');
  } catch (err) {
    console.warn('Redis read failed:', err);
    await incrementMetric('cache_misses');
  }

  const data = await fetchData();

  try {
    await redisClient.set(key, data as Record<string, unknown>, ttlSeconds);
  } catch (err) {
    console.warn('Redis write failed:', err);
  }

  return data;
}
