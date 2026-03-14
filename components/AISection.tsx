'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, Fingerprint } from 'lucide-react';

export default function AISection() {
  return (
    <section className="relative py-32 bg-background border-t border-white/5 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center pointer-events-none">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 1 }}
           className="text-center pointer-events-auto"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#00C8FF]/30 bg-[#00C8FF]/10 text-[#00C8FF] font-medium tracking-wide text-sm mb-6 backdrop-blur-md">
            <BrainCircuit className="w-5 h-5 text-[#00C8FF]" />
            Core Analytics Engine
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8 max-w-3xl mx-auto leading-[1.1]">
            AI that speaks <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#4DEBFF]">
              engineering.
            </span>
          </h2>

          <div className="relative mt-20 max-w-lg mx-auto">
             {/* Floating Panels */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -left-32 -top-16 bg-[#081223]/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center gap-4"
             >
               <div className="p-3 bg-[#00C8FF]/20 rounded-xl text-[#00C8FF]">
                 <Fingerprint className="w-6 h-6" />
               </div>
               <div className="text-left">
                  <div className="text-white font-medium text-sm">Anomaly Detected</div>
                  <div className="text-[#9AA6C4] text-xs">P99 Latency &gt; 1200ms</div>
               </div>
             </motion.div>

             <motion.div 
               animate={{ y: [0, 15, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute -right-32 top-8 bg-[#081223]/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center gap-4"
             >
               <div className="text-left">
                  <div className="text-white font-medium text-sm">Action Suggested</div>
                  <div className="text-[#9AA6C4] text-xs">Scale Redis instances.</div>
               </div>
               <div className="p-3 bg-[#00C8FF]/20 rounded-xl text-[#00C8FF]">
                 <BrainCircuit className="w-6 h-6" />
               </div>
             </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
