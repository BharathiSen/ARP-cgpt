'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Code2, Server, Globe, ShieldCheck, Cpu, Terminal } from 'lucide-react';

const cases = [
  { icon: Server, title: 'Microservices Stress', desc: 'Stress test internal endpoints and downstream dependencies.' },
  { icon: ShieldCheck, title: 'Vulnerability Scanning', desc: 'Identify potential security leaks during reliability simulations.' },
  { icon: Globe, title: 'Global Performance', desc: 'Simulate worldwide latency for globally distributed systems.' },
  { icon: Terminal, title: 'CI/CD Gatekeeping', desc: 'Run reliability tests as part of your deployment pipelines.' },
  { icon: Cpu, title: 'Compute-Intensive API', desc: 'Monitor CPU usage vs performance under fault injection.' },
  { icon: Code2, title: 'API Gateway Testing', desc: 'Ensure your gateways handle high error rates gracefully.' },
];

export default function UseCases() {
  const router = useRouter();

  const handleCardClick = (title: string) => {
    const scenario = encodeURIComponent(`Test my ${title} architecture under heavy load`);
    router.push(`/dashboard?prompt=${scenario}`);
  };

  return (
    <section className="ds-section" id="use-cases">
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="ds-badge mb-5"
            >
              Developer Focused
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="ds-heading text-4xl md:text-5xl"
            >
              Use Cases
            </motion.h2>
          </div>
          <p className="hidden md:block text-sm" style={{ color: 'rgba(0,200,255,0.5)' }}>
            Scroll to explore →
          </p>
        </div>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar scroll-smooth"
           style={{ paddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2))', paddingRight: '1.5rem' }}>
        {cases.map((c, idx) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={idx}
              onClick={() => handleCardClick(c.title)}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.07 }}
              viewport={{ once: true }}
              className="ds-card flex-shrink-0 snap-center p-7 group relative overflow-hidden cursor-pointer hover:border-[#00C8FF]/50 transition-all hover:-translate-y-1"
              style={{ width: 300 }}
            >
              <div className="mb-5 p-3.5 rounded-xl w-fit transition-all duration-300"
                   style={{ background: 'rgba(0,200,255,0.10)', border: '1px solid rgba(0,200,255,0.15)' }}>
                <Icon className="w-6 h-6" style={{ color: '#00C8FF' }} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#9AA6C4' }}>{c.desc}</p>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold tracking-widest"
                   style={{ color: 'rgba(0,200,255,0.25)' }}>
                <span className="w-4 h-px" style={{ background: 'rgba(0,200,255,0.25)' }} />
                CASE #{idx + 101}
              </div>

              <div className="ds-glow-orb w-24 h-24 -bottom-8 -right-8 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
