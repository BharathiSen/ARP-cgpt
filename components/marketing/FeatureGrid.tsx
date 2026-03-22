'use client';

import { motion } from 'framer-motion';
import { features } from '@/lib/features';

export default function FeatureGrid() {
  return (
     <section id="features" className="ds-section">
         <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative bg-[#081223]/70 py-10 px-8 rounded-[2rem] border border-[#1EA7FF]/15 overflow-hidden backdrop-blur-xl hover:shadow-[0_0_40px_rgba(0,200,255,0.4)] transition-all duration-300"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10 mb-6 inline-flex p-4 rounded-xl bg-white/5 border border-white/10 text-white">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4 relative z-10">{feature.title}</h3>
                  <p className="text-[#9AA6C4] leading-relaxed relative z-10">
                    {feature.description}
                  </p>
                  
                  {/* Decorative glowing blob */}
                  <div className={`absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-r ${feature.gradient} rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none`} />
                </motion.div>
              ))}
           </div>
         </div>
     </section>
  );
}
