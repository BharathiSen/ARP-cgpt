import { describe, expect, it } from 'vitest';
import { getTelemetrySnapshot, incrementMetric } from '../lib/telemetry';

describe('telemetry counters', () => {
  it('increments cache counters and computes hit rate', async () => {
    const before = await getTelemetrySnapshot();

    await incrementMetric('cache_hits');
    await incrementMetric('cache_misses');

    const after = await getTelemetrySnapshot();

    expect(after.cache_hits).toBeGreaterThanOrEqual(before.cache_hits + 1);
    expect(after.cache_misses).toBeGreaterThanOrEqual(before.cache_misses + 1);
    expect(after.cache_hit_rate).toBeGreaterThanOrEqual(0);
    expect(after.cache_hit_rate).toBeLessThanOrEqual(100);
  });
});
