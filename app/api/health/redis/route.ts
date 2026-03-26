import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis';

export async function GET() {
  const provider = redisClient.provider === 'none'
    ? 'none'
    : redisClient.provider === 'upstash'
      ? 'upstash'
      : 'local';

  if (!redisClient.isAvailable) {
    return NextResponse.json({
      connected: false,
      provider,
      latency: -1,
    });
  }

  const startedAt = Date.now();
  try {
    await redisClient.get('__redis_health_probe__');
    const latency = Date.now() - startedAt;

    return NextResponse.json({
      connected: true,
      provider,
      latency,
    });
  } catch {
    return NextResponse.json({
      connected: false,
      provider,
      latency: -1,
    });
  }
}
