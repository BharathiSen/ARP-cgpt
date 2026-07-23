import { z } from "zod";

export const httpMethodSchema = z.enum(["GET", "POST"]);
export type HttpMethod = z.infer<typeof httpMethodSchema>;

/** Headers callers are not allowed to override (request smuggling / host abuse). */
const BLOCKED_HEADER_NAMES = new Set([
  "host",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
]);

export const probeOptionsSchema = z.object({
  method: httpMethodSchema.default("GET"),
  concurrency: z.coerce.number().int().min(1).max(20).default(1),
  headers: z.record(z.string(), z.string()).optional().default({}),
  body: z.string().max(10_000).optional(),
});

export type ProbeOptions = z.infer<typeof probeOptionsSchema>;

export function sanitizeCustomHeaders(
  input: Record<string, string> | undefined,
): Record<string, string> {
  if (!input) return {};
  const out: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(input)) {
    const key = rawKey.trim();
    if (!key) continue;
    if (BLOCKED_HEADER_NAMES.has(key.toLowerCase())) continue;
    if (typeof rawValue !== "string") continue;
    out[key] = rawValue.slice(0, 2000);
  }
  return out;
}

export function parseProbeOptions(raw: {
  method?: unknown;
  concurrency?: unknown;
  headers?: unknown;
  body?: unknown;
}): { ok: true; options: ProbeOptions } | { ok: false; error: string } {
  let headers: Record<string, string> = {};
  if (typeof raw.headers === "string" && raw.headers.trim()) {
    try {
      const parsed = JSON.parse(raw.headers) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        headers = sanitizeCustomHeaders(
          parsed as Record<string, string>,
        );
      } else {
        return { ok: false, error: "headers must be a JSON object" };
      }
    } catch {
      return { ok: false, error: "headers must be valid JSON" };
    }
  } else if (raw.headers && typeof raw.headers === "object") {
    headers = sanitizeCustomHeaders(raw.headers as Record<string, string>);
  }

  const result = probeOptionsSchema.safeParse({
    method: raw.method ?? "GET",
    concurrency: raw.concurrency ?? 1,
    headers,
    body: raw.body,
  });

  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "Invalid probe options",
    };
  }

  const options = result.data;
  if (options.method === "GET") {
    options.body = undefined;
  }

  return { ok: true, options };
}

/** Nearest-rank percentile on a sorted copy of samples. */
export function percentile(samples: number[], p: number): number {
  if (!samples.length) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, rank))];
}

export interface LoadMetrics {
  concurrency: number;
  method: HttpMethod;
  sampleCount: number;
  successCount: number;
  errorCount: number;
  errorRatePercent: number;
  p50Ms: number;
  p95Ms: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
}

export function computeLoadMetrics(
  latenciesMs: number[],
  errorCount: number,
  concurrency: number,
  method: HttpMethod,
): LoadMetrics {
  const sampleCount = latenciesMs.length;
  const successCount = Math.max(0, sampleCount - errorCount);
  const avgMs =
    sampleCount === 0
      ? 0
      : latenciesMs.reduce((a, b) => a + b, 0) / sampleCount;

  return {
    concurrency,
    method,
    sampleCount,
    successCount,
    errorCount,
    errorRatePercent:
      sampleCount === 0 ? 0 : Math.round((errorCount / sampleCount) * 1000) / 10,
    p50Ms: Math.round(percentile(latenciesMs, 50)),
    p95Ms: Math.round(percentile(latenciesMs, 95)),
    avgMs: Math.round(avgMs),
    minMs: sampleCount ? Math.round(Math.min(...latenciesMs)) : 0,
    maxMs: sampleCount ? Math.round(Math.max(...latenciesMs)) : 0,
  };
}
