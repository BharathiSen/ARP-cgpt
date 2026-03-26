"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ReliabilityTestScenario() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="w-full max-w-md mx-auto rounded-[20px] p-6 bg-[rgba(8,18,35,0.7)] backdrop-blur-xl border border-[rgba(0,200,255,0.15)] shadow-[0_0_40px_rgba(0,200,255,0.15)] hover:shadow-[0_0_60px_rgba(0,200,255,0.25)] transition-all duration-300"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-8 border-b border-white/5 pb-6">
          <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#00C8FF] mb-2">
            Scenario Builder
          </div>
          <h3 className="text-2xl font-bold text-[#FFFFFF] tracking-tight">
            Reliability Test Scenario
          </h3>
        </div>

        {/* Sections */}
        <div className="space-y-6 flex-1">
          {/* Section 1 */}
          <div>
            <div className="text-xs font-medium text-[#9AA6C4] mb-2 uppercase tracking-wide">
              API Endpoint
            </div>
            <div className="font-mono text-sm inline-flex items-center gap-2 bg-[rgba(0,200,255,0.08)] text-[#4DEBFF] py-[6px] px-[10px] rounded-[6px] border border-[#00C8FF]/10">
              <span className="text-[#00C8FF] font-bold">POST</span>
              /billing/charge
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white/[0.02] p-4 rounded-xl border border-[rgba(0,200,255,0.05)]">
            <div className="text-xs font-medium text-[#9AA6C4] mb-3 uppercase tracking-wide">
              Failure Simulation
            </div>
            <ul className="space-y-3 text-sm text-[#9AA6C4]">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_rgba(0,200,255,0.8)]"></div>
                20% Timeout Injection
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_rgba(0,200,255,0.8)]"></div>
                15% Internal Server Errors
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] shadow-[0_0_8px_rgba(0,200,255,0.8)]"></div>
                Network Latency: +400ms
              </li>
            </ul>
          </div>

          {/* Section 3 & 4 Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-xs font-medium text-[#9AA6C4] mb-1.5 uppercase tracking-wide">
                Traffic Load
              </div>
              <div className="text-white text-sm font-medium">
                500 requests / second
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-[#9AA6C4] mb-1.5 uppercase tracking-wide">
                Simulation Duration
              </div>
              <div className="text-white text-sm font-medium">10 minutes</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <button className="group w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-[rgba(0,200,255,0.1)] border border-white/10 hover:border-[#00C8FF]/30 text-white hover:text-[#4DEBFF] rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,200,255,0.2)]">
            Run Simulation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
