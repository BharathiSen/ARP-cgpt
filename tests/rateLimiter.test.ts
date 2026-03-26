import { describe, expect, it } from 'vitest';
import { checkRateLimit } from '../lib/rateLimiter';

describe('rate limiter', () => {
  it('blocks free-tier requests after limit in a window', async () => {
    const identifier = `free-${Date.now()}-${Math.random()}`;
    let blocked = false;

    for (let i = 0; i < 11; i += 1) {
      const result = await checkRateLimit(identifier, false);
      if (!result.success) blocked = true;
    }

    expect(blocked).toBe(true);
  });

  it('allows first 11 paid-tier requests in a window', async () => {
    const identifier = `paid-${Date.now()}-${Math.random()}`;
    const attempts = await Promise.all(
      Array.from({ length: 11 }, async () => checkRateLimit(identifier, true))
    );

    expect(attempts.every((entry) => entry.success)).toBe(true);
  });
});
