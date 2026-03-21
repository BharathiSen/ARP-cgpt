import prisma from '@/lib/prisma';

export async function runRealSimulation(projectId: string, endpoint: string) {
  const startTime = Date.now();
  let isFailed = false;
  let actualLatency = 0;
  let statusCode = 0;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/json,text/plain',
      },
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
  } catch (err: unknown) {
    actualLatency = Date.now() - startTime;
    isFailed = true;
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      statusCode = 408;
    } else {
      statusCode = 500;
    }
  }

  const status = isFailed ? 'FAILED' : 'SUCCESS';

  // --- FEATURE 1: AI FAILURE ANALYSIS ---
  let insight = '';
  if (isFailed) {
    let failureReason = '';
    let recommendation = '';
    
    if (statusCode === 408) {
      failureReason = `Critical Timeout detected (> ${actualLatency}ms).`;
      recommendation = `Increase API gateway timeouts, vertically scale the database, or introduce asynchronous processing queues for heavy tasks.`;
    } else if (statusCode === 401 || statusCode === 403) {
      failureReason = `Authentication/Authorization failure (HTTP ${statusCode}).`;
      recommendation = `Verify JWT expirations, CORS policies, and ensure the simulation agent holds the proper OAuth scopes.`;
    } else if (statusCode === 429) {
      failureReason = `Rate limit exceeded (HTTP 429 Too Many Requests).`;
      recommendation = `API is dropping connections. Consider configuring a WAF bypass rule for internal testing or implementing exponential backoff in client SDKs.`;
    } else {
      failureReason = `Unexpected Internal or Upstream Error (HTTP ${statusCode}).`;
      recommendation = `Analyze backend logs for crash stack traces. Implement circuit breakers to avoid cascading failures.`;
    }
    
    insight = `[AI Analysis] ${failureReason} ${recommendation}`;
  } else {
    if (actualLatency > 800) {
      insight = `[AI Analysis] Sub-optimal performance detected. Latency is high (${actualLatency}ms). Consider implementing CDN caching, Redis layer for frequent DB queries, or edge-based routing.`;
    } else {
      insight = `[AI Analysis] Target endpoint is highly reliable. Performing at optimal speed (${actualLatency}ms) with successful status ${statusCode}. No immediate architectural changes needed.`;
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
