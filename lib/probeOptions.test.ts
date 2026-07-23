import { describe, expect, it } from "vitest";
import {
  computeLoadMetrics,
  parseProbeOptions,
  percentile,
  sanitizeCustomHeaders,
} from "@/lib/probeOptions";

describe("percentile + load metrics", () => {
  it("computes nearest-rank percentiles", () => {
    const samples = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile(samples, 50)).toBe(50);
    expect(percentile(samples, 95)).toBe(100);
  });

  it("builds load metrics with error rate", () => {
    const metrics = computeLoadMetrics([100, 200, 300], 1, 3, "GET");
    expect(metrics.sampleCount).toBe(3);
    expect(metrics.errorCount).toBe(1);
    expect(metrics.errorRatePercent).toBeCloseTo(33.3, 0);
    expect(metrics.p50Ms).toBe(200);
    expect(metrics.concurrency).toBe(3);
  });
});

describe("parseProbeOptions", () => {
  it("defaults to GET concurrency 1", () => {
    const parsed = parseProbeOptions({});
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.options.method).toBe("GET");
      expect(parsed.options.concurrency).toBe(1);
    }
  });

  it("caps concurrency at 20", () => {
    const parsed = parseProbeOptions({ concurrency: 99 });
    expect(parsed.ok).toBe(false);
  });

  it("accepts POST with body and custom headers", () => {
    const parsed = parseProbeOptions({
      method: "POST",
      concurrency: 5,
      headers: { "X-Test": "1", Host: "evil.com" },
      body: '{"a":1}',
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.options.method).toBe("POST");
      expect(parsed.options.concurrency).toBe(5);
      expect(parsed.options.headers["X-Test"]).toBe("1");
      expect(parsed.options.headers.Host).toBeUndefined();
      expect(parsed.options.body).toBe('{"a":1}');
    }
  });

  it("parses headers JSON string", () => {
    const parsed = parseProbeOptions({
      headers: JSON.stringify({ Authorization: "Bearer x" }),
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.options.headers.Authorization).toBe("Bearer x");
    }
  });

  it("strips blocked headers", () => {
    expect(
      sanitizeCustomHeaders({
        "Transfer-Encoding": "chunked",
        "X-Ok": "yes",
      }),
    ).toEqual({ "X-Ok": "yes" });
  });
});
