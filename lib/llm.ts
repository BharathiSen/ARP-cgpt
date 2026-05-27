import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z, ZodTypeAny } from "zod";
import crypto from "crypto";
import { redisClient } from "./redis";

type CallLLMOpts = {
  model?: string;
  prompt: string;
  schema: ZodTypeAny;
  cacheKey?: string; // optional explicit cache key
  ttlSeconds?: number;
  maxRetries?: number;
};

export async function callLLMSchema<T = any>(opts: CallLLMOpts): Promise<T> {
  const model = opts.model ?? "gpt-4o-mini";
  const schema = opts.schema;
  const ttl = opts.ttlSeconds ?? 60 * 5;
  const maxRetries = opts.maxRetries ?? 2;

  const promptHash = crypto
    .createHash("sha256")
    .update(opts.prompt)
    .digest("hex")
    .slice(0, 24);

  const cacheKey = opts.cacheKey ?? `llm:v1:${model}:p:${promptHash}`;

  if (redisClient.isAvailable) {
    try {
      const cached = await redisClient.get<T>(cacheKey);
      if (cached) return cached;
    } catch {
      // ignore cache failures and proceed
    }
  }

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { object } = await generateObject({
        model: openai(model),
        schema,
        prompt: opts.prompt,
      });

      // Validate with zod just in case
      const parsed = schema.parse(object) as T;

      if (redisClient.isAvailable) {
        try {
          await redisClient.set(cacheKey, parsed as unknown as Record<string, unknown>, ttl);
        } catch {
          // ignore cache set errors
        }
      }

      return parsed;
    } catch (err) {
      lastError = err;
      // simple exponential backoff
      const backoff = 100 * Math.pow(2, attempt - 1);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  throw lastError;
}

export function zStringArraySchema() {
  return z.array(z.string());
}
