import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runRealSimulation } from '@/lib/simulator';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const endpoint = searchParams.get('endpoint');

  if (!projectId || !endpoint) {
    return new Response('Missing parameters', { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  // Real-time SSE Stream
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      try {
        const rateLimit = await checkRateLimit(userId, false);
        if (!rateLimit.success) {
          sendEvent('error', { message: 'Rate limit exceeded' });
          controller.close();
          return;
        }

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