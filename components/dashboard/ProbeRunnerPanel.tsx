"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { HttpMethod, LoadMetrics, Simulation } from "./types";

interface GeneratedConfig {
  concurrency: number;
  description: string;
}

interface ProbeRunnerPanelProps {
  projectName: string;
  endpoint: string;
  method: HttpMethod;
  concurrency: number;
  headerKey: string;
  headerValue: string;
  requestBody: string;
  aiPrompt: string;
  isAIGenerating: boolean;
  generatedConfig: GeneratedConfig | null;
  isSimulating: boolean;
  simulationProgress: number;
  liveLatency: number;
  statusMessage: string;
  simulationResult: Simulation | null;
  liveLoadMetrics: Partial<LoadMetrics> | null;
  onEndpointChange: (value: string) => void;
  onMethodChange: (method: HttpMethod) => void;
  onConcurrencyChange: (value: number) => void;
  onHeaderKeyChange: (value: string) => void;
  onHeaderValueChange: (value: string) => void;
  onRequestBodyChange: (value: string) => void;
  onAiPromptChange: (value: string) => void;
  onAIGenerate: () => void;
  onRunSimulation: () => void;
}

function LoadMetricsDisplay({
  metrics,
}: {
  metrics: Partial<LoadMetrics>;
}) {
  const hasMetrics =
    metrics.p50Ms != null ||
    metrics.p95Ms != null ||
    metrics.errorRatePercent != null;

  if (!hasMetrics) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {metrics.p50Ms != null && (
        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
          <p className="text-[10px] uppercase text-[#9AA6C4] font-semibold mb-1">
            P50 Latency
          </p>
          <p className="text-white font-mono text-lg">
            {Math.round(metrics.p50Ms)}
            <span className="text-xs text-white/40 ml-1">ms</span>
          </p>
        </div>
      )}
      {metrics.p95Ms != null && (
        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
          <p className="text-[10px] uppercase text-[#9AA6C4] font-semibold mb-1">
            P95 Latency
          </p>
          <p className="text-white font-mono text-lg">
            {Math.round(metrics.p95Ms)}
            <span className="text-xs text-white/40 ml-1">ms</span>
          </p>
        </div>
      )}
      {metrics.errorRatePercent != null && (
        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
          <p className="text-[10px] uppercase text-[#9AA6C4] font-semibold mb-1">
            Error Rate
          </p>
          <p
            className="font-mono text-lg"
            style={{
              color: metrics.errorRatePercent > 0 ? "#ff7070" : "#00C8FF",
            }}
          >
            {metrics.errorRatePercent.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}

export function ProbeRunnerPanel({
  projectName,
  endpoint,
  method,
  concurrency,
  headerKey,
  headerValue,
  requestBody,
  aiPrompt,
  isAIGenerating,
  generatedConfig,
  isSimulating,
  simulationProgress,
  liveLatency,
  statusMessage,
  simulationResult,
  liveLoadMetrics,
  onEndpointChange,
  onMethodChange,
  onConcurrencyChange,
  onHeaderKeyChange,
  onHeaderValueChange,
  onRequestBodyChange,
  onAiPromptChange,
  onAIGenerate,
  onRunSimulation,
}: ProbeRunnerPanelProps) {
  const resultMetrics =
    simulationResult?.loadMetrics ??
    simulationResult?.ai?.loadMetrics ??
    liveLoadMetrics;

  return (
    <>
      <div className="ds-card p-8">
        <div className="flex items-center gap-2 mb-8">
          <Play className="w-4 h-4" style={{ color: "#00C8FF" }} />
          <h2 className="font-bold text-white text-sm uppercase tracking-widest">
            Configure Simulation —{" "}
            <span className="ds-gradient-text">{projectName}</span>
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          <div
            className="p-5 rounded-xl"
            style={{
              background: "rgba(0,200,255,0.04)",
              border: "1px solid rgba(0,200,255,0.1)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#00C8FF]" />
              <h3 className="font-semibold text-sm text-white">
                Probe notes helper
              </h3>
            </div>
            <p className="text-xs mb-3" style={{ color: "#9AA6C4" }}>
              Optional tips only — this does not inject failures. The real run
              below sends concurrent HTTP {method} requests.
            </p>
            <div className="flex gap-3">
              <input
                value={aiPrompt}
                onChange={(e) => onAiPromptChange(e.target.value)}
                className="ds-input flex-1 text-sm bg-black/50"
                placeholder="e.g. Check latency on my public API..."
              />
              <Button
                id="ai-generate-btn"
                onClick={onAIGenerate}
                isLoading={isAIGenerating}
                style={{ minWidth: "140px" }}
              >
                Generate
              </Button>
            </div>
            <AnimatePresence>
              {generatedConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <p className="text-xs text-[#9AA6C4] mb-3">
                    {generatedConfig.description}
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] uppercase text-[#9AA6C4] font-semibold mb-1">
                        Suggested concurrency
                      </p>
                      <p className="text-white font-mono">
                        {generatedConfig.concurrency}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="ds-label">Target Endpoint URL</label>
              <input
                value={endpoint}
                onChange={(e) => onEndpointChange(e.target.value)}
                className="ds-input font-mono text-sm w-full"
                placeholder={
                  method === "GET"
                    ? "https://httpbin.org/get"
                    : "https://httpbin.org/post"
                }
              />
            </div>
            <div>
              <label className="ds-label">Method</label>
              <select
                value={method}
                onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
                className="ds-input text-sm w-full md:w-28"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </div>

          <div>
            <label className="ds-label">
              Concurrency ({concurrency} parallel request
              {concurrency !== 1 ? "s" : ""})
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={20}
                value={concurrency}
                onChange={(e) => onConcurrencyChange(Number(e.target.value))}
                className="flex-1 accent-[#00C8FF]"
              />
              <input
                type="number"
                min={1}
                max={20}
                value={concurrency}
                onChange={(e) => {
                  const val = Math.min(20, Math.max(1, Number(e.target.value)));
                  onConcurrencyChange(val);
                }}
                className="ds-input text-sm w-16 text-center font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="ds-label">Custom Header Key (optional)</label>
              <input
                value={headerKey}
                onChange={(e) => onHeaderKeyChange(e.target.value)}
                className="ds-input text-sm font-mono"
                placeholder="X-Custom-Header"
              />
            </div>
            <div>
              <label className="ds-label">Custom Header Value (optional)</label>
              <input
                value={headerValue}
                onChange={(e) => onHeaderValueChange(e.target.value)}
                className="ds-input text-sm font-mono"
                placeholder="value"
              />
            </div>
          </div>

          {method === "POST" && (
            <div>
              <label className="ds-label">POST Body (optional)</label>
              <textarea
                value={requestBody}
                onChange={(e) => onRequestBodyChange(e.target.value)}
                className="ds-input text-sm font-mono min-h-[100px] resize-y"
                placeholder='{"key": "value"}'
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Button
            onClick={onRunSimulation}
            isLoading={isSimulating}
            className="w-full text-base py-3"
          >
            <Play className="w-4 h-4 mr-2" />
            {isSimulating ? "Running Simulation…" : "Run Reliability Test"}
          </Button>

          <AnimatePresence>
            {isSimulating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2 overflow-hidden"
              >
                <div className="flex justify-between items-center text-xs text-[#9AA6C4] font-mono">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-[#00C8FF] animate-spin" />
                    {statusMessage || "Starting simulation..."}
                  </span>
                  <span
                    className={
                      liveLatency > 600 ? "text-[#ff4d4d]" : "text-[#00C8FF]"
                    }
                  >
                    {liveLatency > 0 ? `${liveLatency}ms` : "--"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00C8FF]/50 to-[#00C8FF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${simulationProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="text-[10px] text-right font-mono text-[#00C8FF]/60">
                  {simulationProgress}%
                </div>
                {liveLoadMetrics && (
                  <LoadMetricsDisplay metrics={liveLoadMetrics} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            className="ds-card p-8 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {simulationResult.status === "SUCCESS" ? (
                  <CheckCircle
                    className="w-7 h-7"
                    style={{ color: "#00C8FF" }}
                  />
                ) : (
                  <XCircle className="w-7 h-7" style={{ color: "#ff4d4d" }} />
                )}
                <div>
                  <p className="ds-label mb-0">Result</p>
                  <p className="text-xl font-bold text-white">
                    {simulationResult.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="ds-label mb-0">Avg Latency</p>
                <p className="text-3xl font-mono font-bold ds-gradient-text">
                  {simulationResult.avgLatency.toFixed(0)}
                  <span className="text-base text-white/40">ms</span>
                </p>
              </div>
            </div>

            {resultMetrics && <LoadMetricsDisplay metrics={resultMetrics} />}

            <div
              className="ds-glow-orb w-48 h-48 -bottom-16 -right-16"
              style={{ opacity: 0.12 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
