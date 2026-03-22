import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runRealSimulation } from '@/lib/simulator';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { logApiRequest } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    let user = null;

    // 1. Check for API Key in Authorization header (Bearer token)
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKeyValue = authHeader.substring(7);
      
      // Check multi-key table
      const keyObj = await prisma.apiKey.findUnique({ 
        where: { key: apiKeyValue },
        include: { user: true }
      });
      if (keyObj) {
        user = keyObj.user;
      } else {
        // Fallback to old single-key setup
        user = await prisma.user.findUnique({ where: { apiKey: apiKeyValue } });
      }
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

    const startTime = Date.now();
    const simulation = await runRealSimulation(projectId, endpoint);
    const latency = Date.now() - startTime;

    await logApiRequest({ userId: user.id, endpoint, status: 200, latency });

    return NextResponse.json(simulation);
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { status: 500, errorType: 'internal_error', message: 'Failed to process simulation request.' },
      { status: 500 }
    );
  }
}
