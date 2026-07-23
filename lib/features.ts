import { Activity, BrainCircuit, BarChart3, Radio } from "lucide-react";

/** Feature cards — only claim what the product actually does today. */
export const features = [
  {
    title: "Live Endpoint Probes",
    description:
      "Send real HTTP GET or POST requests to your public API — from a single probe up to 20 concurrent requests — and measure success, latency, and error rate.",
    icon: Activity,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
  {
    title: "Realtime SSE Streaming",
    description:
      "Watch progress, latency, and completion events stream into the dashboard as the probe runs.",
    icon: Radio,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
  {
    title: "AI Reliability Insights",
    description:
      "Turn status codes and latency into structured risk levels, insights, and recommended actions.",
    icon: BrainCircuit,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
  {
    title: "History & Metrics",
    description:
      "Keep per-project run history with honest p50/p95 latency and error-rate metrics, charts, summaries, and exportable JSON reports.",
    icon: BarChart3,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
];
