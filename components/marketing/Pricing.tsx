"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    period: "/mo",
    description: "Full dashboard access with fair-use probe limits.",
    features: [
      "Create projects & run live probes",
      "AI insights on each run",
      "10 requests per minute",
      "API key + JSON export",
    ],
    highlight: false,
    cta: "Get Started",
    href: "/login",
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/mo",
    description: "Higher limits for heavier demo and portfolio usage.",
    features: [
      "Everything in Free",
      "100 requests per minute",
      "Same live SSE dashboard",
      "Paid via Razorpay (optional)",
    ],
    highlight: true,
    cta: "Upgrade with Razorpay",
    href: "/pricing",
  },
  {
    name: "Team",
    price: "—",
    period: "",
    description: "Collaboration features are on the roadmap — not shipping yet.",
    features: [
      "Planned: shared workspaces",
      "Planned: higher org limits",
      "Planned: role-based access",
      "Not available in this demo",
    ],
    highlight: false,
    cta: "Coming soon",
    href: "/#docs",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="ds-section relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center mb-8">
          <div className="ds-badge">
            <Globe className="w-4 h-4" />
            Simple Free + optional Pro
          </div>
        </div>

        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Start free. Upgrade only if you need higher limits.
          </h2>
          <p className="text-lg text-[#9AA6C4] max-w-xl mx-auto">
            Free includes the real product. Pro raises the rate limit via
            Razorpay — there is no fake payment unlock.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative bg-[#081223]/70 rounded-[2rem] p-8 border backdrop-blur-xl hover:shadow-[0_0_40px_rgba(0,200,255,0.4)] transition-all duration-300 ${
                tier.highlight
                  ? "border-[#00C8FF] shadow-[0_0_40px_rgba(0,200,255,0.15)] bg-gradient-to-b from-[#020c1b] to-[#081223]"
                  : "border-[#1EA7FF]/15"
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#00C8FF] text-[#020617] text-xs font-bold rounded-full tracking-wide uppercase">
                  Optional upgrade
                </div>
              )}
              <h3 className="text-2xl font-semibold text-white mb-2">
                {tier.name}
              </h3>
              <div className="text-[#9AA6C4] text-sm h-10 mb-6">
                {tier.description}
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-extrabold text-white tracking-tight">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-[#9AA6C4] text-lg font-medium">
                    {tier.period}
                  </span>
                )}
              </div>

              <Button
                href={tier.href}
                variant="custom"
                className={`w-full py-4 rounded-xl font-semibold transition-all mb-8 ${
                  tier.highlight
                    ? "bg-gradient-to-br from-[#00C8FF] to-[#1EA7FF] text-white shadow-lg"
                    : "bg-white/5 text-white border border-[#4DEBFF]/40 hover:shadow-[0_0_30px_rgba(0,200,255,0.3)]"
                }`}
              >
                {tier.cta}
              </Button>

              <div className="space-y-4">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00C8FF] shrink-0" />
                    <span className="text-[#9AA6C4] text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
