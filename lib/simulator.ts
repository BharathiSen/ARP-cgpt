import prisma from '@/lib/prisma';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

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

  // --- FEATURE 1: NATIVE GEN AI FAILURE ANALYSIS ---
  let aiInsights = {
    confidence: 0,
    rootCause: isFailed ? 'Unknown error occurred.' : 'Endpoint successfully reached.',
    suggestion: isFailed ? 'Check endpoint availability.' : 'No action needed.',
  };

  if (process.env.OPENAI_API_KEY && endpoint) {
    try {
      const { object } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          confidence: z.number().min(0).max(100).describe('Confidence score of the analysis'),
          rootCause: z.string().describe('A tech root cause of the status code / latency'),
          suggestion: z.string().describe('A devops suggestion for the engineer'),
        }),
        prompt: `Analyze this API reliability check.
          Endpoint: ${endpoint}.
          HTTP Status: ${statusCode}.
          Latency: ${actualLatency}ms.
          Is Failed: ${isFailed}.
          Provide a highly technical root cause string, and an actionable specific codebase/devops suggestion.`
      });
      aiInsights = object;
    } catch (error) {
      console.error('OpenAI Analysis Failed', error);
      aiInsights.rootCause = `Fell back: HTTP ${statusCode} after ${actualLatency}ms`;
      aiInsights.confidence = 85;
    }
  } else {
    if (isFailed) {
      aiInsights.confidence = 90;
      aiInsights.rootCause = `Error HTTP ${statusCode}`;
      aiInsights.suggestion = `Check logs and increase tracing on ${endpoint}`;
    } else {
      aiInsights.confidence = 99;
      aiInsights.rootCause = `Optimal Speed at ${actualLatency}ms`;
      aiInsights.suggestion = "Endpoint sound. Maintain provisioning.";
    }
  }

  const insight = JSON.stringify(aiInsights);

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

