'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { time: '10:00', latency: 40, errorRate: 0, retries: 0 },
  { time: '10:05', latency: 45, errorRate: 0, retries: 0 },
  { time: '10:10', latency: 300, errorRate: 2, retries: 5 },
  { time: '10:15', latency: 850, errorRate: 15, retries: 120 },
  { time: '10:20', latency: 920, errorRate: 25, retries: 240 },
  { time: '10:25', latency: 400, errorRate: 5, retries: 30 },
  { time: '10:30', latency: 42, errorRate: 0, retries: 0 },
];

export default function ProductDemo() {
  return (
    <section id="demo" className="py-32 bg-background border-t border-white/5 relative">
       <div className="max-w-7xl mx-auto px-6">
         <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">See the invisible.</h2>
            <p className="text-lg text-slate-400">Identify failures precisely at the moment they occur.</p>
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[2.5rem] bg-[#081223]/70 backdrop-blur-xl border border-[#1EA7FF]/15 p-6 md:p-10 shadow-2xl relative overflow-hidden"
         >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C8FF] to-[#4DEBFF]"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                  <div className="h-72 bg-white/5 rounded-2xl p-6 border border-white/5">
                     <h3 className="text-white text-sm font-medium mb-6">Latency Distribution (ms)</h3>
                     <ResponsiveContainer width="100%" height="80%">
                       <AreaChart data={data}>
                         <defs>
                           <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#00C8FF" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#00C8FF" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                         <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                         <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#ffffff20', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                         />
                         <Area type="monotone" dataKey="latency" stroke="#00C8FF" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                       </AreaChart>
                     </ResponsiveContainer>
                  </div>

                  <div className="h-64 bg-white/5 rounded-2xl p-6 border border-white/5">
                     <h3 className="text-white text-sm font-medium mb-6">Error Rate & Retries</h3>
                     <ResponsiveContainer width="100%" height="80%">
                       <LineChart data={data}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                         <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#ffffff20', borderRadius: '8px' }}
                         />
                         <Line type="monotone" dataKey="errorRate" stroke="#ff4a6b" strokeWidth={2} dot={false} />
                         <Line type="monotone" dataKey="retries" stroke="#4DEBFF" strokeWidth={2} dot={false} />
                       </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-[#020c1b]/60 rounded-2xl p-6 border border-white/5 flex flex-col items-start relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <div className="w-32 h-32 bg-[#00C8FF] rounded-full blur-[50px]"></div>
                 </div>
                 <div className="flex items-center gap-3 mb-6 relative z-10 w-full pb-6 border-b border-white/5">
                   <div className="w-10 h-10 rounded-full bg-[#00C8FF]/20 flex items-center justify-center border border-[#00C8FF]/30">
                     <div className="w-4 h-4 bg-[#00C8FF] rounded-full animate-pulse"></div>
                   </div>
                   <h3 className="text-white font-medium">AI Insight Engine</h3>
                 </div>

                 <div className="space-y-4 relative z-10 flex-1">
                   <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                     <p className="text-[#9AA6C4] text-sm leading-relaxed">
                       <span className="text-red-400 font-semibold">Critical Issue: </span> 
                       Latency spikes detected above 800ms during peak load at 10:15.
                     </p>
                   </div>
                   <div className="bg-[#00C8FF]/10 p-4 rounded-xl border border-[#00C8FF]/20">
                     <p className="text-[#9AA6C4] text-sm leading-relaxed">
                      <span className="text-[#00C8FF] font-semibold">Recommended Action: </span>
                       Consider implementing exponential backoff retries and adding circuit breakers to downstream service requests to prevent resource exhaustion.
                     </p>
                   </div>
                   <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-lg text-white text-sm font-medium">
                     Generate Recovery Logic
                   </button>
                 </div>
               </div>
            </div>
         </motion.div>
       </div>
    </section>
  );
}
