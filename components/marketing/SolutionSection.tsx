"use client";

import { motion } from "framer-motion";

export default function SolutionSection() {
  const steps = [
    {
      number: "01",
      title: "Register API Endpoint",
      desc: "Securely connect the endpoint you want to test.",
    },
    {
      number: "02",
      title: "Configure Reliability Test",
      desc: "Set up failure scenarios like latency injection or timeouts.",
    },
    {
      number: "03",
      title: "Inject Failures",
      desc: "Safely execute faults in a controlled environment.",
    },
    {
      number: "04",
      title: "Analyze with AI",
      desc: "Get automated RCA and recommended actions for resilience.",
    },
  ];

  return (
    <section className="py-32 relative bg-background border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="font-semibold tracking-wider uppercase text-sm mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#4DEBFF]">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto">
            Engineering confidence through chaos.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[#081223]/70 p-8 rounded-3xl border border-[#1EA7FF]/15 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(0,200,255,0.4)] transition-all duration-300 backdrop-blur-xl"
            >
              <div className="text-5xl font-bold text-white/10 mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-[#9AA6C4] text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
