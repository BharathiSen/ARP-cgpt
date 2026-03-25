import prisma from '@/lib/prisma';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StructuredAIAnalysis {
  confidenceScore: number;
  riskLevel: RiskLevel;
  insights: string[];
  suggestions: string[];
  anomalies: string[];
  // Backward compatibility fields
  confidence: number;
  rootCause: string;
  suggestion: string;
}

export interface ProjectAISummary {
  overallHealth: string;
  majorRisks: string[];
  recommendations: string[];
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveRiskLevel(isFailed: boolean, statusCode: number, latency: number): RiskLevel {
  if (isFailed && (statusCode >= 500 || statusCode === 408)) return 'CRITICAL';
  if (isFailed || latency > 1200) return 'HIGH';
  if (latency > 600 || statusCode >= 400) return 'MEDIUM';
  return 'LOW';
}

function buildLegacyCompatibleAnalysis(base: {
  confidenceScore: number;
  riskLevel: RiskLevel;
  insights: string[];
  suggestions: string[];
  anomalies: string[];
}): StructuredAIAnalysis {
  const insights = base.insights.length ? base.insights : ['No significant reliability issues detected.'];
  const suggestions = base.suggestions.length ? base.suggestions : ['No immediate action required.'];
  return {
    confidenceScore: clampScore(base.confidenceScore),
    riskLevel: base.riskLevel,
    insights,
    suggestions,
    anomalies: base.anomalies,
    confidence: clampScore(base.confidenceScore),
    rootCause: insights[0],
    suggestion: suggestions[0],
  };
}

function buildFallbackAnalysis(params: {
  isFailed: boolean;
  statusCode: number;
  latency: number;
  endpoint: string;
}): StructuredAIAnalysis {
  const riskLevel = deriveRiskLevel(params.isFailed, params.statusCode, params.latency);
  const confidence = params.isFailed ? 90 : 98;
  const rootCause = params.isFailed
    ? `Endpoint returned HTTP ${params.statusCode} with ${params.latency}ms latency.`
    : `Endpoint responded successfully in ${params.latency}ms.`;
  const suggestion = params.isFailed
    ? `Inspect upstream logs, add retries, and improve tracing for ${params.endpoint}.`
    : 'Maintain current performance posture and keep latency monitoring in place.';

  const anomalies: string[] = [];
  if (params.latency > 1000) anomalies.push(`High latency anomaly: ${params.latency}ms`);
  if (params.statusCode >= 500) anomalies.push(`Server-side failure pattern: HTTP ${params.statusCode}`);
  if (params.statusCode === 408) anomalies.push('Request timeout anomaly detected');

  return buildLegacyCompatibleAnalysis({
    confidenceScore: confidence,
    riskLevel,
    insights: [rootCause],
    suggestions: [suggestion],
    anomalies,
  });
}

export async function runRealSimulation(projectId: string, endpoint: string) {
  const startTime = Date.now();
  let isFailed = false;
  let actualLatency = 0;
  let statusCode = 0;
  let responseSnippet = '';
  let responseContentType = '';

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
    responseContentType = response.headers.get('content-type') || '';

    // Capture a small safe response snippet for anomaly detection context.
    try {
      const raw = await response.text();
      responseSnippet = raw.slice(0, 500);
    } catch {
      responseSnippet = '';
    }

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

  let aiInsights = buildFallbackAnalysis({
    isFailed,
    statusCode,
    latency: actualLatency,
    endpoint,
  });

  if (process.env.OPENAI_API_KEY && endpoint) {
    try {
      const { object } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          confidenceScore: z.number().min(0).max(100),
          riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
          insights: z.array(z.string()).min(1),
          suggestions: z.array(z.string()).min(1),
          anomalies: z.array(z.string()),
        }),
        prompt: `Analyze the following API response for reliability.

Return STRICT JSON with:
- confidenceScore (0-100)
- riskLevel (LOW/MEDIUM/HIGH/CRITICAL)
- insights (list of key observations)
- suggestions (actionable fixes)
- anomalies (unexpected patterns or failures)

Context:
- Endpoint: ${endpoint}
- Status code: ${statusCode}
- Latency: ${actualLatency}ms
- Failure state: ${isFailed}
- Response content-type: ${responseContentType || 'unknown'}
- Response snippet: ${responseSnippet || 'N/A'}

Focus on:
- performance issues
- failure patterns
- system bottlenecks
- reliability risks`,
      });
      aiInsights = buildLegacyCompatibleAnalysis(object);
    } catch (error) {
      console.error('OpenAI Analysis Failed', error);
      aiInsights = buildFallbackAnalysis({
        isFailed,
        statusCode,
        latency: actualLatency,
        endpoint,
      });
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
      confidenceScore: aiInsights.confidenceScore,
      riskLevel: aiInsights.riskLevel,
      insights: aiInsights.insights,
      suggestions: aiInsights.suggestions,
      anomalies: aiInsights.anomalies,
    },
  });

  return { ...simulation, ai: aiInsights };
}

export async function generateProjectReliabilitySummary(simulations: Array<{
  endpoint: string;
  status: string;
  avgLatency: number;
  failureRate: number;
  createdAt: Date;
}>): Promise<ProjectAISummary> {
  if (!simulations.length) {
    return {
      overallHealth: 'No simulation data available yet.',
      majorRisks: ['Insufficient telemetry to assess reliability risks.'],
      recommendations: ['Run multiple simulations across peak and off-peak conditions.'],
    };
  }

  const failureCount = simulations.filter((s) => s.status === 'FAILED').length;
  const avgLatency = simulations.reduce((acc, s) => acc + s.avgLatency, 0) / simulations.length;
  const failureRate = (failureCount / simulations.length) * 100;

  const fallbackSummary: ProjectAISummary = {
    overallHealth:
      failureRate > 30
        ? 'Unstable reliability posture with significant failure concentration.'
        : avgLatency > 800
          ? 'Performance degradation risk with elevated latency profile.'
          : 'Generally stable system reliability with manageable risk.',
    majorRisks: [
      `Failure rate over sampled runs: ${failureRate.toFixed(1)}%`,
      `Average latency across sampled runs: ${avgLatency.toFixed(0)}ms`,
    ],
    recommendations: [
      'Introduce latency SLO alerts and endpoint-level tracing.',
      'Apply retry/circuit-breaker patterns on unstable dependencies.',
    ],
  };

  if (!process.env.OPENAI_API_KEY) return fallbackSummary;

  try {
    const recent = simulations.slice(-20).map((s) => ({
      endpoint: s.endpoint,
      status: s.status,
      avgLatency: s.avgLatency,
      failureRate: s.failureRate,
      createdAt: s.createdAt,
    }));

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        overallHealth: z.string(),
        majorRisks: z.array(z.string()).min(1),
        recommendations: z.array(z.string()).min(1),
      }),
      prompt: `Analyze these API test results and summarize system reliability.

Return STRICT JSON with:
- overallHealth
- majorRisks (array)
- recommendations (array)

Dataset:
${JSON.stringify(recent)}`,
    });

    return object;
  } catch (error) {
    console.error('Project reliability summary generation failed:', error);
    return fallbackSummary;
  }
}

