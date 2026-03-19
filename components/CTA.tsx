'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-32 relative bg-[#05070f] border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[400px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur-[150px]"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
             <Play className="w-10 h-10 text-cyan-400 fill-cyan-400/20" />
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
            Build Reliable APIs <br/> With Confidence.
          </h2>
          <p className="text-xl text-[#9AA6C4] mb-12 max-w-2xl mx-auto">
             Join thousands of engineers who trust AI Reliability Lab to uncover hidden flaws before they hit production.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/login" className="group inline-flex items-center gap-3 px-8 py-5 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl hover:shadow-[0_0_50px_rgba(0,180,255,0.4)] transition-all">
              Start Testing Your API
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard" className="px-8 py-5 text-lg font-bold text-white/70 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white transition-all">
              Run Your First Simulation
            </Link>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%]" 
              style={{ background: 'radial-gradient(circle at center, transparent 0%, #05070f 70%)' }} />
      </div>
    </section>
  );
}
