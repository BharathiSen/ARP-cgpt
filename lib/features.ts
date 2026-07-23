import { Activity, BrainCircuit, BarChart3, Radio } from "lucide-react";

/** Feature cards — only claim what the product actually does today. */
export const features = [
  {
    title: "Live Endpoint Probes",
    description:
      "Send a real HTTP request to your public API and measure whether it succeeds and how long it takes.",
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
      "Keep per-project run history, charts, summaries, and exportable JSON reports for later review.",
    icon: BarChart3,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
];
