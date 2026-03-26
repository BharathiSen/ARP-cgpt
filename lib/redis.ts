import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

export type RedisProvider = "upstash" | "ioredis" | "none";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface UnifiedRedisClient {
  provider: RedisProvider;
  isAvailable: boolean;
  get<T>(key: string): Promise<T | null>;
  set(
    key: string,
    value: JsonValue | Record<string, unknown>,
    ttlSeconds?: number,
  ): Promise<void>;
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
}

const upstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);
const redisUrl = process.env.REDIS_URL;

const upstash = upstashConfigured ? UpstashRedis.fromEnv() : null;
const ioredis =
  !upstashConfigured && redisUrl
    ? new IORedis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        lazyConnect: true,
      })
    : null;

if (!upstashConfigured && !redisUrl) {
  console.warn(
    "Redis not configured: set UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN or REDIS_URL",
  );
}

if (ioredis) {
  ioredis.on("error", (error) => {
    console.error("ioredis error:", error);
  });
}

function tryParse<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value !== "string") return value as T;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export const redisClient: UnifiedRedisClient = {
  provider: upstash ? "upstash" : ioredis ? "ioredis" : "none",
  isAvailable: Boolean(upstash || ioredis),

  async get<T>(key: string): Promise<T | null> {
    if (upstash) {
      const value = await upstash.get(key);
      return tryParse<T>(value);
    }

    if (ioredis) {
      if (ioredis.status === "wait") {
        await ioredis.connect();
      }
      const value = await ioredis.get(key);
      return tryParse<T>(value);
    }

    return null;
  },

  async set(
    key: string,
    value: JsonValue | Record<string, unknown>,
    ttlSeconds?: number,
  ): Promise<void> {
    const payload = JSON.stringify(value);

    if (upstash) {
      if (ttlSeconds && ttlSeconds > 0) {
        await upstash.set(key, payload, { ex: ttlSeconds });
      } else {
        await upstash.set(key, payload);
      }
      return;
    }

    if (ioredis) {
      if (ioredis.status === "wait") {
        await ioredis.connect();
      }
      if (ttlSeconds && ttlSeconds > 0) {
        await ioredis.set(key, payload, "EX", ttlSeconds);
      } else {
        await ioredis.set(key, payload);
      }
    }
  },

  async del(key: string): Promise<number> {
    if (upstash) {
      return await upstash.del(key);
    }

    if (ioredis) {
      if (ioredis.status === "wait") {
        await ioredis.connect();
      }
      return await ioredis.del(key);
    }

    return 0;
  },

  async incr(key: string): Promise<number> {
    if (upstash) {
      return await upstash.incr(key);
    }

    if (ioredis) {
      if (ioredis.status === "wait") {
        await ioredis.connect();
      }
      return await ioredis.incr(key);
    }

    throw new Error("Redis unavailable");
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (upstash) {
      await upstash.expire(key, ttlSeconds);
      return;
    }

    if (ioredis) {
      if (ioredis.status === "wait") {
        await ioredis.connect();
      }
      await ioredis.expire(key, ttlSeconds);
    }
  },
};
