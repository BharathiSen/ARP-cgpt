'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Code2, Server, Globe, ShieldCheck, Cpu, Terminal } from 'lucide-react';

const cases = [
  {
    icon: <Server className="w-8 h-8 text-[#00C8FF]" />,
    title: "Microservices Stress",
    desc: "Stress test internal endpoints and downstream dependencies.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-[#4DEBFF]" />,
    title: "Vulnerability Scanning",
    desc: "Identify potential security leaks during reliability simulations.",
  },
  {
    icon: <Globe className="w-8 h-8 text-[#00C8FF]" />,
    title: "Global Performance",
    desc: "Simulate worldwide latency for globally distributed systems.",
  },
  {
    icon: <Terminal className="w-8 h-8 text-[#4DEBFF]" />,
    title: "CI/CD Gatekeeping",
    desc: "Run reliability tests as part of your deployment pipelines.",
  },
  {
    icon: <Cpu className="w-8 h-8 text-[#00C8FF]" />,
    title: "Compute-Intensive API",
    desc: "Monitor CPU usage vs performance under fault injection.",
  },
  {
    icon: <Code2 className="w-8 h-8 text-[#4DEBFF]" />,
    title: "API Gateway Testing",
    desc: "Ensure your gateways handle high error rates gracefully.",
  }
];

export default function UseCases() {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 px-6 bg-[#05070f] overflow-hidden">
      <div className="max-w-7xl mx-auto mb-16 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
             <motion.p 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="text-[#00C8FF] font-bold tracking-widest text-sm uppercase mb-4"
             >
               Developer Focused
             </motion.p>
             <motion.h2 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="text-white text-5xl font-bold tracking-tight mb-6"
             >
               Use Cases
             </motion.h2>
          </div>
          <div className="hidden md:flex gap-2 text-[#9AA6C4]/30 text-xs font-bold uppercase tracking-widest">
             Scroll horizontally <span className="animate-pulse">→</span>
          </div>
        </div>
      </div>

      <div 
        ref={targetRef}
        className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar px-6 lg:px-[calc((100vw-80rem)/2)] scroll-smooth custom-scrollbar"
      >
        {cases.map((useCase, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex-shrink-0 w-80 snap-center glass-card p-10 relative group hover:border-[#00C8FF]/30 transition-all duration-300"
          >
            <div className="mb-6 p-4 rounded-xl bg-[#00C8FF]/5 w-fit group-hover:bg-[#00C8FF]/10 transition-all">
               {useCase.icon}
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white mb-4">{useCase.title}</h3>
            <p className="text-[#9AA6C4] text-sm leading-relaxed">{useCase.desc}</p>
            
            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-[#00C8FF]/20 uppercase tracking-widest font-mono">
               <span className="w-4 h-[2px] bg-[#00C8FF]/10" />
               CASE #10{idx + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
