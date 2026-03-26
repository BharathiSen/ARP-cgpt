import { ShieldAlert, Activity, BrainCircuit, BarChart3 } from "lucide-react";

export const features = [
  {
    title: "Failure Simulation",
    description:
      "Inject faults safely into your API endpoints to see how your system reacts to real-world outages.",
    icon: ShieldAlert,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
  {
    title: "Load Testing Engine",
    description:
      "Stress test endpoints to uncover bottlenecks and scale limits before your users do.",
    icon: Activity,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
  {
    title: "AI Log Diagnostics",
    description:
      "Connect your logs and let our AI core detect anomalies, predict failures, and suggest fixes.",
    icon: BrainCircuit,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
  {
    title: "Reliability Metrics",
    description:
      "Track latency distribution, retry patterns, and error rates in real-time dashboards.",
    icon: BarChart3,
    gradient: "from-[#00C8FF] to-[#4DEBFF]",
  },
];
