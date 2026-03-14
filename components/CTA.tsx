'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-32 relative bg-background border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[400px] bg-gradient-to-r from-[#00C8FF] to-[#1EA7FF] rounded-full blur-[150px]"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-[#00C8FF]">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
            Build Reliable APIs <br/> With Confidence.
          </h2>
          <p className="text-xl text-[#9AA6C4] mb-12 max-w-2xl mx-auto">
             Join thousands of engineers who trust AI Reliability Lab to uncover the hidden flaws before they hit production.
          </p>
          
          <button className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-br from-[#00C8FF] to-[#1EA7FF] rounded-2xl hover:shadow-[0_0_50px_rgba(0,200,255,0.6)] transition-all">
            Start Testing Your API
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
