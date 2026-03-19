'use client';

import { motion } from 'framer-motion';
import { Target, Zap, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: Target,
    title: 'Configure Scenario',
    desc: 'Define your API endpoint, set the expected latency threshold, and choose your failure injection rate.',
    step: '01',
    color: '#00C8FF',
  },
  {
    icon: Zap,
    title: 'Execute Simulation',
    desc: 'Our engine performs real-world stress testing, injecting faults and measuring performance in real-time.',
    step: '02',
    color: '#4DEBFF',
  },
  {
    icon: BarChart3,
    title: 'Analyze Insights',
    desc: 'Receive deep-dive reports on how your system degrades. Identify single points of failure instantly.',
    step: '03',
    color: '#00C8FF',
  },
];

export default function HowItWorks() {
  return (
    <section className="ds-section">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="ds-badge mx-auto mb-5"
          >
            Workflow
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="ds-heading text-4xl md:text-5xl mb-5"
          >
            How It Works
          </motion.h2>
          <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: '#9AA6C4' }}>
            Bridge the gap between development and production reliability.
            Test with confidence before every deployment.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="ds-card p-8 relative overflow-hidden group"
              >
                {/* Step number — top right decorative */}
                <div className="absolute top-6 right-6 text-5xl font-black leading-none select-none"
                     style={{ color: 'rgba(0,200,255,0.06)' }}>
                  {step.step}
                </div>

                {/* Icon */}
                <div className="mb-6 p-4 rounded-xl w-fit transition-all duration-300"
                     style={{ background: 'rgba(0,200,255,0.10)', border: '1px solid rgba(0,200,255,0.15)' }}>
                  <Icon className="w-7 h-7" style={{ color: step.color }} />
                </div>

                {/* Label */}
                <div className="text-xs font-bold mb-2 tracking-widest uppercase" style={{ color: 'rgba(0,200,255,0.5)' }}>
                  Step {step.step}
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9AA6C4' }}>{step.desc}</p>

                {/* Decorative glow */}
                <div className="ds-glow-orb w-32 h-32 -bottom-10 -right-10 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
