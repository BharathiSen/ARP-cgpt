'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Clock, ZapOff } from 'lucide-react';
import ReliabilityTestScenario from './ReliabilityTestScenario';

export default function ProblemSection() {
  return (
    <section className="ds-section relative overflow-hidden">


      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8 }}
        >
          <div className="font-semibold tracking-wider uppercase text-sm mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#4DEBFF]">The Problem</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            APIs fail. <br />
            Are you ready when they do?
          </h2>
          <p className="text-lg text-[#9AA6C4] mb-10 max-w-lg">
            Network latency, third-party downtimes, and unexpected traffic spikes cause cascading failures in modern microservices. You can't rely on hoping things just work.
          </p>
          
          <div className="space-y-6">
             <div className="flex gap-4 items-start">
               <div className="p-3 bg-[#00C8FF]/10 rounded-lg">
                 <Clock className="w-6 h-6 text-[#00C8FF]" />
               </div>
               <div>
                  <h3 className="text-white font-medium text-lg mb-1">Timeouts & Latency</h3>
                  <p className="text-[#9AA6C4]">Requests backing up and eating memory limits.</p>
               </div>
             </div>
             <div className="flex gap-4 items-start">
               <div className="p-3 bg-[#00C8FF]/10 rounded-lg">
                 <AlertCircle className="w-6 h-6 text-[#00C8FF]" />
               </div>
               <div>
                  <h3 className="text-white font-medium text-lg mb-1">Failed Requests</h3>
                  <p className="text-[#9AA6C4]">5xx errors multiplying quickly across dependent services.</p>
               </div>
             </div>
             <div className="flex gap-4 items-start">
               <div className="p-3 bg-[#00C8FF]/10 rounded-lg">
                 <ZapOff className="w-6 h-6 text-[#00C8FF]" />
               </div>
               <div>
                  <h3 className="text-white font-medium text-lg mb-1">Unpredictable Retry Loops</h3>
                  <p className="text-[#9AA6C4]">Accidentally ddosing your own infrastructure.</p>
               </div>
             </div>
          </div>
        </motion.div>
        
        <div className="w-full relative lg:pl-10 flex items-center justify-center">
          <ReliabilityTestScenario />
        </div>
      </div>
    </section>
  );
}
