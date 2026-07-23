export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface LoadMetrics {
  concurrency: number;
  method: string;
  sampleCount: number;
  successCount: number;
  errorCount: number;
  errorRatePercent: number;
  p50Ms: number;
  p95Ms: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
}

export interface Simulation {
  id: string;
  endpoint: string;
  status: string;
  avgLatency: number;
  latency?: number;
  failureRate?: number;
  insight?: string;
  confidenceScore?: number;
  riskLevel?: RiskLevel;
  insights?: string[];
  recommendedActions?: string[];
  suggestions?: string[];
  anomalies?: string[];
  loadMetrics?: LoadMetrics;
  ai?: {
    confidenceScore: number;
    riskLevel: RiskLevel;
    insights: string[];
    recommendedActions: string[];
    suggestions?: string[];
    anomalies: string[];
    reasoning?: string;
    signalsUsed?: string[];
    confidence?: number;
    rootCause?: string;
    suggestion?: string;
    loadMetrics?: LoadMetrics;
  };
  createdAt: string;
}

export interface ProjectSummary {
  overallHealth: string;
  majorRisks: string[];
  recommendedActions: string[];
  recommendations?: string[];
}

export interface Project {
  id: string;
  name: string;
  simulations?: Simulation[];
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export interface RedisObservability {
  cache_hit_rate: number;
  rate_limit_blocked: number;
  redis: {
    connected: boolean;
    provider: "upstash" | "local";
    latency: number;
  };
}

export type FetchProjectsOptions = {
  ensureProject?: Project;
  selectProjectId?: string;
};

export type HttpMethod = "GET" | "POST";
