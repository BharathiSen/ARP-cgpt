import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runRealSimulation } from '@/lib/simulator';
import { checkRateLimit } from '@/lib/rateLimiter';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userEmail = session.user.email;
  if (!userEmail) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, isPaid: true },
  });

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const endpoint = searchParams.get('endpoint');

  if (!projectId || !endpoint) {
    return new Response('Missing parameters', { status: 400 });
  }

  const rateLimit = await checkRateLimit(user.id, user.isPaid);
  if (!rateLimit.success) {
    return new Response(JSON.stringify({ message: 'Rate limit exceeded', retryAfter: 60 }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.reset?.toString() || '',
      },
    });
  }

  // Real-time SSE Stream
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      try {
        sendEvent('status', { message: 'Simulation Validated' });
        
        // Brief artificial delay for UI realism before hitting real checks
        await new Promise(r => setTimeout(r, 800));
        sendEvent('status', { message: 'Connecting to API endpoint...' });

        // Run the real simulation block natively
        const simulation = await runRealSimulation(projectId, endpoint);

        // Emit final result
        sendEvent('complete', { simulation });
      } catch (err) {
        sendEvent('error', { message: 'Simulation failed to stream' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}