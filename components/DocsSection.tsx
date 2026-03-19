'use client';

import { motion } from 'framer-motion';
import { Terminal, Copy, Check, Info } from 'lucide-react';
import { useState } from 'react';

const codeString = `curl -X POST https://airlb.ai/api/simulate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "endpoint": "https://api.yourlab.com/v1/auth",
    "failureRate": 25,
    "latency": 500
  }'`;

export default function DocsSection() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 px-6 bg-[#05070f] relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-4"
          >
            Documentation
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-8 leading-tight"
          >
            Built for <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent italic">Engineers.</span> 
            Integrated in minutes.
          </motion.h2>
          <div className="space-y-6 text-white/50 mb-10 leading-relaxed">
            <p className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/70">1</span>
              Simulate high-load scenarios globally using our simple, secure REST API. 
              No agents, no SDKs, just pure reliability testing.
            </p>
            <p className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/70">2</span>
              Integrate with your CI/CD pipeline to automatically block unreliable 
              deployments before they reach your customers.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 text-sm text-white/70">
               <Info className="w-4 h-4 text-blue-400" /> API v2.0 Live
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 text-sm text-white/70">
              <Terminal className="w-4 h-4 text-green-400" /> CLI Available
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0a0c14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group"
        >
          {/* Mock Header */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/30" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
              <div className="w-3 h-3 rounded-full bg-green-500/30" />
            </div>
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Terminal Output</div>
          </div>
          
          {/* Code Body */}
          <div className="p-8 font-mono text-sm overflow-x-auto relative">
            <button 
              onClick={copyToClipboard}
              className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/50"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            
            <pre className="text-white/70">
              <span className="text-blue-400">curl</span> <span className="text-white/50">-X</span> POST https://airlb.ai/api/simulate \{'\n'}
              {'  '}<span className="text-white/50">-H</span> <span className="text-cyan-400">"Authorization: Bearer YOUR_API_KEY"</span> \{'\n'}
              {'  '}<span className="text-white/50">-d</span> <span className="text-yellow-400/80">'{'{'}{'\n'}
              {'    '}</span><span className="text-emerald-400">"endpoint"</span>: <span className="text-cyan-400">"https://api.yourlab.com/v1/auth"</span>,{'\n'}
              {'    '}<span className="text-emerald-400">"failureRate"</span>: <span className="text-blue-400">25</span>,{'\n'}
              {'    '}<span className="text-emerald-400">"latency"</span>: <span className="text-blue-400">500</span>{'\n'}
              {'  '}<span className="text-yellow-400/80">{'}'}'</span>
            </pre>
          </div>
          
          {/* Decorative Glow */}
          <div className="absolute inset-0 bg-blue-500/10 blur-[100px] -z-10 group-hover:bg-blue-500/20 transition-all" />
        </motion.div>
      </div>
    </section>
  );
}
