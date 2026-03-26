import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runRealSimulation } from '@/lib/simulator';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { logApiRequest } from '@/lib/logger';
import { redisClient } from '@/lib/redis';
import { createHash } from 'crypto';

function simulationCacheKey(userId: string, projectId: string, endpoint: string) {
  const endpointHash = createHash('sha256').update(endpoint).digest('hex').slice(0, 20);
  return `simulation:v1:user:${userId}:project:${projectId}:endpoint:${endpointHash}`;
}

export async function POST(req: Request) {
  try {
    let user = null;

    // 1. Check for API Key in Authorization header (Bearer token)
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKeyValue = authHeader.substring(7);
      
      user = await prisma.user.findUnique({ where: { apiKey: apiKeyValue } });
    }

    // 2. Fallback to Session Auth if no valid API key found
    if (!user) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        user = await prisma.user.findUnique({ where: { email: session.user.email } });
      }
    }

    if (!user) {
      return NextResponse.json(
        { status: 401, errorType: 'auth_error', message: 'Unauthorized: Invalid API Key or Session' },
        { status: 401 }
      );
    }

    // Rate Limiting
    const rateLimit = await checkRateLimit(user.id, user.isPaid);
    if (!rateLimit.success) {
      await logApiRequest({ userId: user.id, endpoint: 'simulate', status: 429, latency: 0 });
      return NextResponse.json(
        { status: 429, errorType: 'rate_limit', message: 'Rate limit exceeded', retryAfter: 60 },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset?.toString() || '',
          }
        }
      );
    }

    const body = await req.json();
    const { projectId, endpoint } = body;

    if (!projectId || !endpoint) {
      await logApiRequest({ userId: user.id, endpoint: 'simulate', status: 400, latency: 0 });
      return NextResponse.json(
        { status: 400, errorType: 'validation_error', message: 'Missing required parameters: projectId and endpoint' },
        { status: 400 }
      );
    }

    const cacheKey = simulationCacheKey(user.id, projectId, endpoint);
    if (redisClient.isAvailable) {
      const cached = await redisClient.get<{
        latency: number;
        status: string;
        ai: unknown;
      }>(cacheKey);

      if (cached) {
        const simulation = await prisma.simulation.create({
          data: {
            projectId,
            endpoint,
            failureRate: cached.status === 'FAILED' ? 100 : 0,
            latency: Math.round(cached.latency),
            status: cached.status,
            avgLatency: cached.latency,
            insight: JSON.stringify(cached.ai ?? {}),
          },
          select: {
            id: true,
            projectId: true,
            endpoint: true,
            failureRate: true,
            latency: true,
            status: true,
            avgLatency: true,
            insight: true,
            createdAt: true,
          },
        });

        await redisClient.del(`user_projects:${user.id}`);

        return NextResponse.json({
          ...simulation,
          latency: simulation.latency,
          status: simulation.status,
          ai: cached.ai,
          cached: true,
        });
      }
    }

    const startTime = Date.now();
    const simulation = await runRealSimulation(projectId, endpoint);
    const latency = Date.now() - startTime;

    if (redisClient.isAvailable) {
      await redisClient.set(
        cacheKey,
        {
          latency: simulation.latency,
          status: simulation.status,
          ai: simulation.ai,
        },
        90
      );
      await redisClient.del(`user_projects:${user.id}`);
    }

    await logApiRequest({ userId: user.id, endpoint, status: 200, latency });

    return NextResponse.json({
      ...simulation,
      latency: simulation.latency,
      status: simulation.status,
      ai: simulation.ai,
    });
  } catch (error) {
    console.error('Simulation error:', error);
    const detail = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 500,
        errorType: 'internal_error',
        message: 'Failed to process simulation request.',
        ...(process.env.NODE_ENV !== 'production' ? { detail } : {}),
      },
      { status: 500 }
    );
  }
}
