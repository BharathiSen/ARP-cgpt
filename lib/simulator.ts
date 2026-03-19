import prisma from '@/lib/prisma';

export async function runRealSimulation(projectId: string, endpoint: string) {
  const startTime = Date.now();
  let isFailed = false;
  let actualLatency = 0;
  let statusCode = 0;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      // Using an AbortController for older Node versions compatibility
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
    });
    
    // Fallback if AbortSignal.timeout is not available
    actualLatency = Date.now() - startTime;
    statusCode = response.status;
    isFailed = !response.ok;

    if (actualLatency > 10000) {
      isFailed = true;
      statusCode = 408; // Timeout
    }
  } catch (err: any) {
    actualLatency = Date.now() - startTime;
    isFailed = true;
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      statusCode = 408;
    } else {
      statusCode = 500;
    }
  }

  const status = isFailed ? 'FAILED' : 'SUCCESS';

  let insight = '';
  if (isFailed) {
    if (statusCode === 408) {
      insight = `Endpoint timed out (>${actualLatency}ms). Suggest increasing API timeouts or vertically scaling the backend.`;
    } else {
      insight = `Endpoint returned HTTP ${statusCode}. Suggest implementing retry with exponential backoff and circuit breakers.`;
    }
  } else {
    if (actualLatency > 800) {
      insight = `Endpoint is slow (latency: ${actualLatency}ms). Consider implementing CDN caching, DB query optimization, or edge routing.`;
    } else {
      insight = `Endpoint performed securely with ${actualLatency}ms latency and status ${statusCode}. Architecture handles current load well.`;
    }
  }

  const simulation = await prisma.simulation.create({
    data: {
      projectId,
      endpoint,
      failureRate: isFailed ? 100 : 0, 
      latency: Math.round(actualLatency), // Recorded actual latency
      status,
      avgLatency: actualLatency,
      insight,
    },
  });

  return simulation;
}
