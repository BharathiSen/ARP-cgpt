import { Redis } from '@upstash/redis';

const hasRedisConfig = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
export const redisCache = hasRedisConfig ? Redis.fromEnv() : null;

export async function getCachedOrFetch<T>(
  key: string,
  fetchData: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  if (!redisCache) return fetchData();

  try {
    const cached = await redisCache.get<T>(key);
    if (cached) {
      console.log(`Redis Cache Hit: ${key}`);
      return cached;
    }
  } catch (err) {
    console.warn('Redis read failed:', err);
  }

  const data = await fetchData();

  try {
    if (redisCache) {
      await redisCache.setex(key, ttlSeconds, JSON.stringify(data));
    }
  } catch (err) {
    console.warn('Redis write failed:', err);
  }

  return data;
}
