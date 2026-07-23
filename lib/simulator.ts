import prisma from "@/lib/prisma";
import { z } from "zod";
import { callLLMSchema } from "@/lib/llm";
import { assertSafeHttpUrl } from "@/lib/urlSafety";
import {
  computeLoadMetrics,
  parseProbeOptions,
  type LoadMetrics,
  type ProbeOptions,
} from "@/lib/probeOptions";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface StructuredAIAnalysis {
  confidenceScore: number;
  riskLevel: RiskLevel;
  insights: string[];
  recommendedActions: string[];
  suggestions?: string[];
  anomalies: string[];
  reasoning: string;
  signalsUsed: string[];
  confidence?: number;
  rootCause?: string;
  suggestion?: string;
  loadMetrics?: LoadMetrics;
}

export interface ProjectAISummary {
  overallHealth: string;
  majorRisks: string[];
  recommendedActions: string[];
  recommendations?: string[];
}

export type SimulationResult = {
  id: string;
  projectId: string;
  endpoint: string;
  failureRate: number;
  latency: number;
  status: string;
  avgLatency: number;
  insight: string;
  createdAt: Date;
  ai: StructuredAIAnalysis;
  loadMetrics: LoadMetrics;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveRiskLevel(
  isFailed: boolean,
  statusCode: number,
  latency: number,
  errorRatePercent: number,
): RiskLevel {
  if (errorRatePercent >= 50) return "CRITICAL";
  if (isFailed && (statusCode >= 500 || statusCode === 408)) return "CRITICAL";
  if (isFailed || latency > 1200 || errorRatePercent >= 20) return "HIGH";
  if (latency > 600 || statusCode >= 400 || errorRatePercent > 0) return "MEDIUM";
  return "LOW";
}

function buildLegacyCompatibleAnalysis(base: {
  confidenceScore: number;
  riskLevel: RiskLevel;
  insights: string[];
  recommendedActions?: string[];
  suggestions?: string[];
  anomalies: string[];
  reasoning?: string;
  signalsUsed?: string[];
  loadMetrics?: LoadMetrics;
}): StructuredAIAnalysis {
  const insights = base.insights.length
    ? base.insights
    : ["No significant reliability issues detected."];
  const actionsSource = base.recommendedActions?.length
    ? base.recommendedActions
    : (base.suggestions ?? []);
  const recommendedActions = actionsSource.length
    ? actionsSource
    : ["No immediate action required."];
  return {
    confidenceScore: clampScore(base.confidenceScore),
    riskLevel: base.riskLevel,
    insights,
    recommendedActions,
    anomalies: base.anomalies,
    reasoning:
      base.reasoning ??
      "Analysis generated from latency, status code, failure state, and anomaly heuristics.",
    signalsUsed: base.signalsUsed ?? [
      "latency",
      "statusCode",
      "failureState",
      "anomalyPatterns",
      "loadMetrics",
    ],
    loadMetrics: base.loadMetrics,
  };
}

function buildFallbackAnalysis(params: {
  isFailed: boolean;
  statusCode: number;
  latency: number;
  endpoint: string;
  loadMetrics: LoadMetrics;
}): StructuredAIAnalysis {
  const riskLevel = deriveRiskLevel(
    params.isFailed,
    params.statusCode,
    params.latency,
    params.loadMetrics.errorRatePercent,
  );
  const confidence = params.isFailed ? 90 : 98;
  const rootCause =
    params.loadMetrics.concurrency > 1
      ? `Load probe (${params.loadMetrics.concurrency} concurrent ${params.loadMetrics.method}s): errorRate=${params.loadMetrics.errorRatePercent}%, p50=${params.loadMetrics.p50Ms}ms, p95=${params.loadMetrics.p95Ms}ms.`
      : params.isFailed
        ? `Endpoint returned HTTP ${params.statusCode} with ${params.latency}ms latency.`
        : `Endpoint responded successfully in ${params.latency}ms.`;
  const suggestion = params.isFailed
    ? `Inspect upstream logs, add retries, and improve tracing for ${params.endpoint}.`
    : params.loadMetrics.p95Ms > 800
      ? "p95 latency is elevated — profile slow handlers and downstream calls."
      : "Maintain current performance posture and keep latency monitoring in place.";

  const anomalies: string[] = [];
  if (params.loadMetrics.p95Ms > 1000)
    anomalies.push(`High p95 latency: ${params.loadMetrics.p95Ms}ms`);
  if (params.loadMetrics.errorRatePercent > 0)
    anomalies.push(`Error rate: ${params.loadMetrics.errorRatePercent}%`);
  if (params.statusCode >= 500)
    anomalies.push(`Server-side failure pattern: HTTP ${params.statusCode}`);
  if (params.statusCode === 408)
    anomalies.push("Request timeout anomaly detected");

  return buildLegacyCompatibleAnalysis({
    confidenceScore: confidence,
    riskLevel,
    insights: [rootCause],
    recommendedActions: [suggestion],
    anomalies,
    reasoning: `Fallback reliability reasoning: status=${params.statusCode}, p50=${params.loadMetrics.p50Ms}ms, p95=${params.loadMetrics.p95Ms}ms, errors=${params.loadMetrics.errorRatePercent}%.`,
    signalsUsed: [
      "latency",
      "statusCode",
      "failureState",
      "anomalyPatterns",
      "loadMetrics",
    ],
    loadMetrics: params.loadMetrics,
  });
}

type ProbeSample = {
  latencyMs: number;
  statusCode: number;
  ok: boolean;
  contentType: string;
  snippet: string;
  responseHeaders: Record<string, string>;
  timeoutType: "NONE" | "ABORT_TIMEOUT" | "NETWORK_ERROR";
};

async function executeSingleProbe(
  url: string,
  options: ProbeOptions,
): Promise<ProbeSample> {
  const started = Date.now();
  const headers: Record<string, string> = {
    "User-Agent":
      "API-Reliability-Lab/1.0 (+https://arp-cgpt.vercel.app; probe)",
    Accept: "application/json,text/plain,*/*",
    ...options.headers,
  };

  if (options.method === "POST" && options.body && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.method === "POST" ? options.body : undefined,
      redirect: "manual",
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
    });

    const latencyMs = Date.now() - started;
    let snippet = "";
    try {
      snippet = (await response.text()).slice(0, 500);
    } catch {
      snippet = "";
    }

    const timedOut = latencyMs > 10000;
    return {
      latencyMs,
      statusCode: timedOut ? 408 : response.status,
      ok: !timedOut && response.ok,
      contentType: response.headers.get("content-type") || "",
      snippet,
      responseHeaders: Object.fromEntries(
        Array.from(response.headers.entries())
          .slice(0, 12)
          .map(([k, v]) => [k, v.slice(0, 200)]),
      ),
      timeoutType: timedOut ? "ABORT_TIMEOUT" : "NONE",
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - started;
    const isTimeout =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      latencyMs,
      statusCode: isTimeout ? 408 : 500,
      ok: false,
      contentType: "",
      snippet: "",
      responseHeaders: {},
      timeoutType: isTimeout ? "ABORT_TIMEOUT" : "NETWORK_ERROR",
    };
  }
}

export async function runRealSimulation(
  projectId: string,
  endpoint: string,
  rawOptions?: {
    method?: unknown;
    concurrency?: unknown;
    headers?: unknown;
    body?: unknown;
  },
): Promise<SimulationResult> {
  const safeEndpoint = await assertSafeHttpUrl(endpoint);
  const parsed = parseProbeOptions(rawOptions ?? {});
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }
  const options = parsed.options;

  const historical = await prisma.simulation.aggregate({
    where: { projectId, endpoint: safeEndpoint },
    _avg: { avgLatency: true },
  });
  const historicalAvgLatency = historical._avg.avgLatency ?? 0;

  // Fire N concurrent probes (1–20). One retry only when concurrency === 1.
  let samples: ProbeSample[] = await Promise.all(
    Array.from({ length: options.concurrency }, () =>
      executeSingleProbe(safeEndpoint, options),
    ),
  );

  if (options.concurrency === 1 && !samples[0]?.ok) {
    const first = samples[0];
    if (
      first &&
      (first.statusCode >= 500 || first.statusCode === 408)
    ) {
      samples = [await executeSingleProbe(safeEndpoint, options)];
    }
  }

  const latencies = samples.map((s) => s.latencyMs);
  const errorCount = samples.filter((s) => !s.ok).length;
  const loadMetrics = computeLoadMetrics(
    latencies,
    errorCount,
    options.concurrency,
    options.method,
  );

  const representative =
    samples.find((s) => !s.ok) ?? samples[0] ?? {
      latencyMs: 0,
      statusCode: 500,
      ok: false,
      contentType: "",
      snippet: "",
      responseHeaders: {},
      timeoutType: "NETWORK_ERROR" as const,
    };

  const isFailed = errorCount > 0;
  const status = isFailed ? "FAILED" : "SUCCESS";
  const actualLatency = loadMetrics.avgMs;

  let aiInsights = buildFallbackAnalysis({
    isFailed,
    statusCode: representative.statusCode,
    latency: actualLatency,
    endpoint: safeEndpoint,
    loadMetrics,
  });

  if (process.env.OPENAI_API_KEY) {
    try {
      const schema = z.object({
        confidenceScore: z.number().min(0).max(100),
        riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        insights: z.array(z.string()).min(1),
        recommendedActions: z.array(z.string()).min(1),
        anomalies: z.array(z.string()),
        reasoning: z.string().min(1),
        signalsUsed: z.array(z.string()).min(1),
      });

      const prompt = `Analyze the following API load probe for reliability.

Return STRICT JSON with:
- confidenceScore (0-100)
- riskLevel (LOW/MEDIUM/HIGH/CRITICAL)
- insights (list of key observations)
- recommendedActions (actionable fixes)
- anomalies (unexpected patterns or failures)

Context:
- Endpoint: ${safeEndpoint}
- Method: ${options.method}
- Concurrency: ${options.concurrency}
- Sample count: ${loadMetrics.sampleCount}
- Error rate: ${loadMetrics.errorRatePercent}%
- p50 latency: ${loadMetrics.p50Ms}ms
- p95 latency: ${loadMetrics.p95Ms}ms
- Avg latency: ${loadMetrics.avgMs}ms
- Representative status code: ${representative.statusCode}
- Historical average latency: ${historicalAvgLatency.toFixed(2)}ms
- Response content-type: ${representative.contentType || "unknown"}
- Response snippet: ${representative.snippet || "N/A"}

Focus on performance, failure patterns, and reliability risks.`;

      const object = await callLLMSchema({
        model: "gpt-4o-mini",
        prompt,
        schema,
        cacheKey: `analysis:${safeEndpoint}:${options.method}:${options.concurrency}:${loadMetrics.p95Ms}:${loadMetrics.errorRatePercent}`,
        ttlSeconds: 90,
        maxRetries: 2,
      });

      aiInsights = buildLegacyCompatibleAnalysis({
        ...object,
        loadMetrics,
      });
    } catch (error) {
      console.error("OpenAI Analysis Failed", error);
      aiInsights = buildFallbackAnalysis({
        isFailed,
        statusCode: representative.statusCode,
        latency: actualLatency,
        endpoint: safeEndpoint,
        loadMetrics,
      });
    }
  }

  const insight = JSON.stringify(aiInsights);

  const simulation = await prisma.simulation.create({
    data: {
      projectId,
      endpoint: safeEndpoint,
      failureRate: loadMetrics.errorRatePercent,
      latency: Math.round(actualLatency),
      status,
      avgLatency: actualLatency,
      insight,
      confidenceScore: aiInsights.confidenceScore,
      riskLevel: aiInsights.riskLevel,
      insights: aiInsights.insights,
      suggestions: aiInsights.recommendedActions,
      anomalies: aiInsights.anomalies,
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

  return { ...simulation, ai: aiInsights, loadMetrics };
}

export async function generateProjectReliabilitySummary(
  simulations: Array<{
    endpoint: string;
    status: string;
    avgLatency: number;
    failureRate: number;
    createdAt: Date;
  }>,
): Promise<ProjectAISummary> {
  if (!simulations.length) {
    return {
      overallHealth: "No simulation data available yet.",
      majorRisks: ["Insufficient telemetry to assess reliability risks."],
      recommendedActions: [
        "Run multiple simulations across peak and off-peak conditions.",
      ],
    };
  }

  const failureCount = simulations.filter((s) => s.status === "FAILED").length;
  const avgLatency =
    simulations.reduce((acc, s) => acc + s.avgLatency, 0) / simulations.length;
  const failureRate = (failureCount / simulations.length) * 100;

  const fallbackSummary: ProjectAISummary = {
    overallHealth:
      failureRate > 30
        ? "Unstable reliability posture with significant failure concentration."
        : avgLatency > 800
          ? "Performance degradation risk with elevated latency profile."
          : "Generally stable system reliability with manageable risk.",
    majorRisks: [
      `Failure rate over sampled runs: ${failureRate.toFixed(1)}%`,
      `Average latency across sampled runs: ${avgLatency.toFixed(0)}ms`,
    ],
    recommendedActions: [
      "Introduce latency SLO alerts and endpoint-level tracing.",
      "Apply retry/circuit-breaker patterns on unstable dependencies.",
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

    const schema = z.object({
      overallHealth: z.string(),
      majorRisks: z.array(z.string()).min(1),
      recommendedActions: z.array(z.string()).min(1),
    });

    const prompt = `Analyze these API test results and summarize system reliability.

Return STRICT JSON with:
- overallHealth
- majorRisks (array)
- recommendedActions (array)

Dataset:
${JSON.stringify(recent)}`;

    const object = await callLLMSchema({
      model: "gpt-4o-mini",
      prompt,
      schema,
      cacheKey: `project_summary:${recent.map((r) => r.endpoint).join("|")}`,
      ttlSeconds: 60,
      maxRetries: 2,
    });

    return {
      overallHealth: object.overallHealth,
      majorRisks: object.majorRisks,
      recommendedActions: object.recommendedActions,
    };
  } catch (error) {
    console.error("Project reliability summary generation failed:", error);
    return fallbackSummary;
  }
}
