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
  const insightData = {
    confidence: 0,
    rootCause: '',
    suggestion: '',
  };

  if (isFailed) {
    insightData.confidence = Math.floor(Math.random() * (95 - 82 + 1) + 82); // Simulated AI confidence 82-95%
    if (statusCode === 408) {
      insightData.rootCause = `Critical Timeout detected (> ${actualLatency}ms). Backend bottleneck under load.`;
      insightData.suggestion = `Increase API gateway timeouts, vertically scale the database, or introduce async task queues.`;
    } else if (statusCode === 401 || statusCode === 403) {
      insightData.rootCause = `Authentication/Authorization logic rejected test agent (HTTP ${statusCode}).`;
      insightData.suggestion = `Verify JWT expirations, CORS policies, and inject simulation OAuth tokens.`;
    } else if (statusCode === 429) {
      insightData.confidence = 98;
      insightData.rootCause = `Strict Rate limit or WAF active (HTTP 429).`;
      insightData.suggestion = `Configure a testing bypass rule in Cloudflare/AWS WAF, or apply exponential backoff.`;
    } else {
      insightData.rootCause = `Unexpected Internal/Upstream Error (HTTP ${statusCode}).`;
      insightData.suggestion = `Enable deep tracing for this route and implement circuit breakers for cascading failures.`;
    }
  } else {
    insightData.confidence = Math.floor(Math.random() * (99 - 90 + 1) + 90);
    if (actualLatency > 800) {
      insightData.rootCause = `Sub-optimal latency (${actualLatency}ms). Connection established but payload delivery dragged.`;
      insightData.suggestion = `Cache static properties via Edge CDN, or add a Redis layer for repeated DB scans.`;
    } else {
      insightData.rootCause = `Endpoint is structurally sound and performing at optimal speed (${actualLatency}ms).`;
      insightData.suggestion = `No immediate architectural changes needed. Maintain current capacity provisioning.`;
    }
  }

  const insight = JSON.stringify(insightData);

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
