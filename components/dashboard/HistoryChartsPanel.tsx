"use client";

import { Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Project, RedisObservability, Simulation } from "./types";

const PIE_COLORS = ["#00C8FF", "#ff4d4d"];

interface ChartPoint {
  run: string;
  latency: number;
}

interface PieSlice {
  name: string;
  value: number;
}

interface HistoryChartsPanelProps {
  selectedProject: Project;
  observability: RedisObservability | null;
  validChartData: ChartPoint[];
  pieData: PieSlice[];
  successCount: number;
  failureCount: number;
}

function SystemHealthBanner({ simulations }: { simulations: Simulation[] }) {
  const fails = simulations.filter((s) => s.status === "FAILED");
  const failRate = Math.round((fails.length / simulations.length) * 100);
  const latencies = simulations.map((s) => s.avgLatency).sort((a, b) => a - b);
  const p95Idx = Math.floor(latencies.length * 0.95);
  const p95 = latencies.length > 0 ? latencies[p95Idx] : 0;
  const lastIncident =
    fails.length > 0
      ? new Date(fails[0].createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "None recently";

  let statusColor = "#00C8FF";
  let statusText = "Healthy";
  if (failRate > 20) {
    statusColor = "#ff4d4d";
    statusText = "Critical";
  } else if (failRate > 5 || p95 > 800) {
    statusColor = "#f59e0b";
    statusText = "Degraded";
  }

  return (
    <div className="ds-card p-5 flex items-center justify-between mb-5">
      <div className="flex items-center gap-4">
        <div
          className="relative flex items-center justify-center w-12 h-12 rounded-full"
          style={{ background: `${statusColor}15` }}
        >
          <Activity className="w-6 h-6" style={{ color: statusColor }} />
          {statusText === "Healthy" && (
            <span
              className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900"
              style={{ background: statusColor }}
            />
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#9AA6C4] font-bold mb-1">
            System Status
          </p>
          <p className="text-lg font-bold" style={{ color: statusColor }}>
            {statusText}
          </p>
        </div>
      </div>
      <div className="flex gap-8 text-right">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#9AA6C4] font-bold mb-1">
            Failure Rate
          </p>
          <p className="text-lg font-mono text-white">{failRate}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#9AA6C4] font-bold mb-1">
            P95 Latency
          </p>
          <p className="text-lg font-mono text-white">
            {p95.toFixed(0)}
            <span className="text-xs text-white/40 ml-1">ms</span>
          </p>
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] uppercase tracking-widest text-[#9AA6C4] font-bold mb-1">
            Last Incident
          </p>
          <p className="text-lg text-white/90">{lastIncident}</p>
        </div>
      </div>
    </div>
  );
}

export function HistoryChartsPanel({
  selectedProject,
  observability,
  validChartData,
  pieData,
  successCount,
  failureCount,
}: HistoryChartsPanelProps) {
  const simulations = selectedProject.simulations ?? [];
  const hasSimulations = simulations.length > 0;

  return (
    <>
      {hasSimulations && <SystemHealthBanner simulations={simulations} />}

      {hasSimulations && (
      <div
        className="ds-card p-5 mb-5"
        style={{ border: "1px solid rgba(0,200,255,0.18)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest">
            Observability
          </h3>
          <span
            className="text-[11px] font-mono"
            style={{
              color: observability?.redis.connected ? "#00C8FF" : "#ff7070",
            }}
          >
            {observability?.redis.connected
              ? "Redis Healthy"
              : "Redis Unavailable"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(0,200,255,0.06)",
              border: "1px solid rgba(0,200,255,0.14)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "#9AA6C4" }}
            >
              Cache Hit Rate
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {observability?.cache_hit_rate?.toFixed(1) ?? "0.0"}%
            </p>
          </div>
          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(255,77,77,0.06)",
              border: "1px solid rgba(255,77,77,0.14)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "#9AA6C4" }}
            >
              Requests Blocked
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {observability?.rate_limit_blocked ?? 0}
            </p>
          </div>
          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "#9AA6C4" }}
            >
              Redis
            </p>
            <p className="text-sm font-semibold text-white mt-1">
              {(observability?.redis.provider ?? "local").toUpperCase()}{" "}
              {observability?.redis.connected
                ? `(${observability?.redis.latency ?? -1}ms)`
                : "(offline)"}
            </p>
          </div>
        </div>
      </div>
      )}

      {hasSimulations && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="ds-card p-6">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-4">
            Latency Trend
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={validChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <XAxis
                  dataKey="run"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickMargin={10}
                  padding={{ left: 20, right: 20 }}
                  interval={0}
                  angle={0}
                  textAnchor="middle"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9AA6C4"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    border: "1px solid #1E293B",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#00C8FF" }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#00C8FF"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: "#0F172A",
                    stroke: "#00C8FF",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="ds-card p-6">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-4">
            Reliability Split
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    border: "1px solid #1E293B",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#00C8FF" }}
                />
                <span className="text-xs text-slate-300">
                  Success ({successCount})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#ff4d4d" }}
                />
                <span className="text-xs text-slate-300">
                  Failed ({failureCount})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="ds-card overflow-hidden">
        <div
          className="px-6 py-4 flex items-center gap-2"
          style={{ borderBottom: "1px solid rgba(0,200,255,0.10)" }}
        >
          <Activity className="w-4 h-4" style={{ color: "#00C8FF" }} />
          <h3 className="font-bold text-white text-sm uppercase tracking-widest">
            Run History
          </h3>
        </div>
        <div
          className="max-h-[280px] overflow-y-auto no-scrollbar divide-y"
          style={{ borderColor: "rgba(0,200,255,0.08)" }}
        >
          {!hasSimulations && (
            <p
              className="p-8 text-center text-sm"
              style={{ color: "#9AA6C4" }}
            >
              No simulations yet. Run your first test above.
            </p>
          )}
          {simulations
            .slice()
            .reverse()
            .map((sim) => (
              <div
                key={sim.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <p
                    className="text-sm font-mono truncate text-white"
                    style={{ maxWidth: 220 }}
                  >
                    {sim.endpoint}
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "#9AA6C4" }}
                  >
                    {new Date(sim.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={
                      sim.status === "SUCCESS"
                        ? {
                            background: "rgba(0,200,255,0.12)",
                            color: "#00C8FF",
                          }
                        : {
                            background: "rgba(255,50,50,0.12)",
                            color: "#ff7070",
                          }
                    }
                  >
                    {sim.status}
                  </span>
                  <p className="text-sm font-mono text-right w-16 text-white">
                    {sim.avgLatency.toFixed(0)}ms
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
