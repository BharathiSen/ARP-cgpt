'use client';

import { motion } from 'framer-motion';
import HeroVideoBackground from './HeroVideoBackground';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-20 section-gradient">
      <HeroVideoBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pointer-events-none flex flex-col items-center justify-center text-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-auto flex flex-col items-center w-full"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00C8FF]/30 bg-[#00C8FF]/10 text-[#00C8FF] text-xs font-bold mb-8 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C8FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C8FF]"></span>
            </span>
            Platform Live v2.0
          </div>
          
          <h1 
            className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.05]"
          >
            Test Your API <br className="hidden md:block" />
            <span className="text-gradient drop-shadow-[0_0_20px_rgba(0,200,255,0.3)]">
              Reliability.
            </span>
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-[#9AA6C4] font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Simulate failures, stress test endpoints, and analyze system behavior with AI-powered insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="btn-primary flex items-center gap-2 group">
              Start Testing Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View Product Demo
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Subtle overlay to enhance contrast */}
      <div className="absolute inset-0 bg-[#05070f]/40 pointer-events-none" />
    </section>
  );
}
