import { NextResponse } from 'next/server';
import { getTelemetrySnapshot } from '@/lib/telemetry';
import { redisClient } from '@/lib/redis';

export async function GET() {
  const telemetry = await getTelemetrySnapshot();
  const provider = redisClient.provider === 'none'
    ? 'none'
    : redisClient.provider === 'upstash'
      ? 'upstash'
      : 'local';

  let connected = false;
  let latency = -1;

  if (redisClient.isAvailable) {
    const startedAt = Date.now();
    try {
      await redisClient.get('__redis_health_probe__');
      connected = true;
      latency = Date.now() - startedAt;
    } catch {
      connected = false;
      latency = -1;
    }
  }

  return NextResponse.json({
    ...telemetry,
    redis: {
      connected,
      provider,
      latency,
    },
  });
}
