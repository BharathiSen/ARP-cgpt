'use client';

import { motion } from 'framer-motion';
import HeroVideoBackground from './HeroVideoBackground';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-20">
      <HeroVideoBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full pointer-events-none flex flex-col items-center justify-center text-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-auto flex flex-col items-center w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00C8FF]/30 bg-[#00C8FF]/10 text-[#00C8FF] text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C8FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C8FF]"></span>
            </span>
            Platform Live v2.0
          </div>
          
          <h1 
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}
          >
            Test Your API Reliability <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#4DEBFF] drop-shadow-md">
              Before Production.
            </span>
          </h1>
          
          <p 
            className="text-lg md:text-xl text-[#9AA6C4] font-semibold max-w-2xl mx-auto mb-10"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
          >
            Simulate failures, stress test endpoints, and analyze system behavior with AI-powered insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white bg-gradient-to-br from-[#00C8FF] to-[#1EA7FF] rounded-xl hover:shadow-[0_0_40px_rgba(0,200,255,0.4)] transition-all">
              Start Testing Free
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white border border-[#4DEBFF]/40 bg-white/5 backdrop-blur-md rounded-xl hover:shadow-[0_0_40px_rgba(0,200,255,0.4)] transition-all">
              View Product Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
