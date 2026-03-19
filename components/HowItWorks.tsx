'use client';

import { motion } from 'framer-motion';
import { Target, Zap, BarChart3 } from 'lucide-center';
import { Target as TargetIcon, Zap as ZapIcon, BarChart3 as ChartIcon } from 'lucide-react';

const steps = [
  {
    icon: <TargetIcon className="w-8 h-8 text-[#00C8FF]" />,
    title: "Configure Scenario",
    desc: "Define your API endpoint, set the expected latency threshold, and choose your failure injection rate.",
  },
  {
    icon: <ZapIcon className="w-8 h-8 text-[#4DEBFF]" />,
    title: "Execute Simulation",
    desc: "Our engine performs real-world stress testing, injecting faults and measuring performance in real-time.",
  },
  {
    icon: <ChartIcon className="w-8 h-8 text-[#00C8FF]" />,
    title: "Analyze Insights",
    desc: "Receive deep-dive reports on how your system degrades. Identify single points of failure instantly.",
  }
];

export default function HowItWorks() {
  return (
    <section id="features" className="py-24 px-6 section-gradient">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[#00C8FF] font-bold tracking-widest text-sm uppercase mb-4"
          >
            Workflow
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-white text-5xl font-bold tracking-tight mb-6"
          >
            How It Works
          </motion.h2>
          <p className="text-[#9AA6C4] max-w-2xl mx-auto text-lg leading-relaxed">
            Our platform bridges the gap between development and production reliability. 
            Test with confidence before every deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="glass-card p-10 relative overflow-hidden group hover:border-[#00C8FF]/30 transition-all duration-300"
            >
              <div className="mb-6 p-4 bg-[#00C8FF]/5 rounded-2xl w-fit group-hover:bg-[#00C8FF]/10 transition-all duration-300">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white mb-4">{step.title}</h3>
              <p className="text-[#9AA6C4] leading-relaxed italic">{step.desc}</p>
              
              <div className="mt-8 text-xs font-bold text-[#00C8FF]/30 font-mono tracking-widest">STEP 0{idx + 1}</div>
              
              {/* Subtle hover glow */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#00C8FF]/5 rounded-full blur-3xl group-hover:bg-[#00C8FF]/10 transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
