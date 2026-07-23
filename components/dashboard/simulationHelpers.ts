import type { ApiErrorResponse, Project, RiskLevel, Simulation } from "./types";

export function getSimulationAI(sim: Simulation) {
  if (sim.ai) return sim.ai;

  if (sim.insight) {
    try {
      const legacy = JSON.parse(sim.insight) as {
        confidence?: number;
        rootCause?: string;
        suggestion?: string;
        confidenceScore?: number;
        riskLevel?: RiskLevel;
        insights?: string[];
        recommendedActions?: string[];
        suggestions?: string[];
        anomalies?: string[];
        reasoning?: string;
        signalsUsed?: string[];
        loadMetrics?: Simulation["loadMetrics"];
      };

      const confidenceScore = Math.round(
        legacy.confidenceScore ?? legacy.confidence ?? 0,
      );

      return {
        confidenceScore,
        riskLevel: legacy.riskLevel ?? "MEDIUM",
        insights:
          legacy.insights ?? (legacy.rootCause ? [legacy.rootCause] : []),
        recommendedActions:
          legacy.recommendedActions ??
          legacy.suggestions ??
          (legacy.suggestion ? [legacy.suggestion] : []),
        suggestions:
          legacy.suggestions ?? (legacy.suggestion ? [legacy.suggestion] : []),
        anomalies: legacy.anomalies ?? [],
        reasoning: legacy.reasoning,
        signalsUsed: legacy.signalsUsed,
        confidence: legacy.confidence,
        rootCause: legacy.rootCause,
        suggestion: legacy.suggestion,
        loadMetrics: legacy.loadMetrics,
      };
    } catch {
      return null;
    }
  }

  if (
    sim.insights ||
    sim.recommendedActions ||
    sim.suggestions ||
    sim.anomalies
  ) {
    return {
      confidenceScore: Math.round(sim.confidenceScore ?? 0),
      riskLevel: sim.riskLevel ?? "MEDIUM",
      insights: sim.insights ?? [],
      recommendedActions: sim.recommendedActions ?? sim.suggestions ?? [],
      suggestions: sim.suggestions ?? [],
      anomalies: sim.anomalies ?? [],
      reasoning: undefined,
      signalsUsed: undefined,
      loadMetrics: sim.loadMetrics,
    };
  }

  return null;
}

export function getRiskStyle(risk: RiskLevel) {
  if (risk === "LOW")
    return {
      color: "#00C8FF",
      border: "1px solid rgba(0,200,255,0.35)",
      background: "rgba(0,200,255,0.12)",
    };
  if (risk === "MEDIUM")
    return {
      color: "#f59e0b",
      border: "1px solid rgba(245,158,11,0.35)",
      background: "rgba(245,158,11,0.12)",
    };
  if (risk === "HIGH")
    return {
      color: "#fb7185",
      border: "1px solid rgba(251,113,133,0.35)",
      background: "rgba(251,113,133,0.12)",
    };
  return {
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.4)",
    background: "rgba(239,68,68,0.12)",
  };
}

export function getActionPriority(
  action: string,
  riskLevel?: RiskLevel,
): "HIGH" | "MEDIUM" | "LOW" {
  const text = action.toLowerCase();
  if (
    text.includes("immediate") ||
    text.includes("critical") ||
    text.includes("urgent") ||
    riskLevel === "CRITICAL" ||
    riskLevel === "HIGH"
  ) {
    return "HIGH";
  }
  if (
    text.includes("monitor") ||
    text.includes("consider") ||
    text.includes("optimize") ||
    riskLevel === "MEDIUM"
  ) {
    return "MEDIUM";
  }
  return "LOW";
}

export function getPriorityStyle(priority: "HIGH" | "MEDIUM" | "LOW") {
  if (priority === "HIGH")
    return {
      color: "#ff8a8a",
      borderColor: "rgba(239,68,68,0.4)",
      background: "rgba(239,68,68,0.1)",
    };
  if (priority === "MEDIUM")
    return {
      color: "#fbbf24",
      borderColor: "rgba(245,158,11,0.4)",
      background: "rgba(245,158,11,0.1)",
    };
  return {
    color: "#86e9ff",
    borderColor: "rgba(0,200,255,0.35)",
    background: "rgba(0,200,255,0.08)",
  };
}

export async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const { error } = data as ApiErrorResponse;
    if (typeof error === "string" && error) return error;
  }
  return fallback;
}

export function isProject(value: unknown): value is Project {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      typeof value.id === "string" &&
      "name" in value &&
      typeof value.name === "string",
  );
}

export function normalizeProject(value: unknown): Project | null {
  if (!isProject(value)) return null;
  return {
    ...value,
    simulations: Array.isArray(value.simulations) ? value.simulations : [],
  };
}

export function getProjectNameKey(name: string) {
  return name.trim().toLowerCase();
}

export function mergeProjectIntoList(list: Project[], project: Project) {
  return [
    project,
    ...list.filter(
      (item) =>
        item.id !== project.id &&
        getProjectNameKey(item.name) !== getProjectNameKey(project.name),
    ),
  ];
}

export function maskApiKey(key: string) {
  if (!key) return "";
  return key.slice(0, 12) + "**************" + key.slice(-6);
}
