"use client";

import { Zap, Sparkles, Loader2 } from "lucide-react";
import type { ProjectSummary } from "./types";
import {
  getRiskStyle,
  getActionPriority,
  getPriorityStyle,
} from "./simulationHelpers";

type SimulationAI = NonNullable<
  ReturnType<typeof import("./simulationHelpers").getSimulationAI>
>;

interface AiSummaryPanelProps {
  aiSummary: ProjectSummary | null;
  isGeneratingSummary: boolean;
  primaryAIData: SimulationAI | null;
  simulationCount: number;
}

export function AiSummaryPanel({
  aiSummary,
  isGeneratingSummary,
  primaryAIData,
  simulationCount,
}: AiSummaryPanelProps) {
  return (
    <div
      className="ds-card p-6 mb-5"
      style={{
        background:
          "linear-gradient(to right, rgba(0,200,255,0.05), rgba(0,0,0,0))",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-[#00C8FF]" />
        <h3 className="font-bold text-white text-sm uppercase tracking-widest">
          AI Analysis
        </h3>
        {primaryAIData ? (
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/20">
              <Sparkles className="w-3 h-3 text-[#00C8FF]" />
              <span className="text-[10px] font-mono text-[#00C8FF]">
                {primaryAIData.confidenceScore}% Confidence
              </span>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={getRiskStyle(primaryAIData.riskLevel)}
            >
              {primaryAIData.riskLevel}
            </span>
          </div>
        ) : null}
      </div>
      {isGeneratingSummary ? (
        <div className="flex items-center gap-3 text-sm text-[#9AA6C4]">
          <Loader2 className="w-4 h-4 animate-spin text-[#00C8FF]" /> Generating
          insights across {simulationCount} runs...
        </div>
      ) : (
        <div className="space-y-3 text-sm leading-relaxed text-[#9AA6C4]">
          <p>
            {aiSummary?.overallHealth ||
              "Summary unavailable right now. Run another simulation to refresh AI analysis."}
          </p>

          {primaryAIData?.reasoning ? (
            <div
              className="text-xs leading-relaxed px-3 py-2 rounded-lg border"
              style={{
                color: "#9AA6C4",
                borderColor: "rgba(0,200,255,0.18)",
                background: "rgba(0,200,255,0.06)",
              }}
            >
              {primaryAIData.reasoning}
            </div>
          ) : null}

          {aiSummary?.majorRisks?.length ? (
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#ff9b9b]">
                Major Risks
              </span>
              <ul className="mt-1 space-y-1">
                {aiSummary.majorRisks.map((risk, idx) => (
                  <li key={`risk-${idx}`}>- {risk}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {primaryAIData?.insights?.length ? (
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#ff9b9b]">
                Insights
              </span>
              <ul className="mt-1 space-y-1">
                {primaryAIData.insights.map((insight, idx) => (
                  <li key={`insight-${idx}`}>- {insight}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {aiSummary?.recommendedActions?.length ||
          aiSummary?.recommendations?.length ? (
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#00C8FF]">
                Recommended Actions
              </span>
              <ul className="mt-1 space-y-1">
                {(aiSummary.recommendedActions ?? aiSummary.recommendations)?.map(
                  (action, idx) => {
                    const priority = getActionPriority(action);
                    const priorityStyle = getPriorityStyle(priority);
                    return (
                      <li
                        key={`rec-${idx}`}
                        className="flex items-start justify-between gap-2"
                      >
                        <span>- {action}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded border font-semibold"
                          style={priorityStyle}
                        >
                          {priority}
                        </span>
                      </li>
                    );
                  },
                )}
              </ul>
            </div>
          ) : null}

          {primaryAIData?.signalsUsed?.length ? (
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#86e9ff]">
                Signals Used
              </span>
              <div className="mt-1 flex flex-wrap gap-2">
                {primaryAIData.signalsUsed.map((signal, idx) => (
                  <span
                    key={`signal-${idx}`}
                    className="text-[10px] px-2 py-1 rounded-full border"
                    style={{
                      borderColor: "rgba(0,200,255,0.25)",
                      color: "#86e9ff",
                      background: "rgba(0,200,255,0.08)",
                    }}
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
