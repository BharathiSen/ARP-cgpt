'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for individual developers establishing baselines.',
    features: ['Basic reliability tests', '100 requests per run', 'Community Discord support', 'Standard dashboard'],
    highlight: false,
  },
  {
    name: 'Developer',
    price: '$49',
    period: '/mo',
    description: 'Advanced simulation tools for serious engineering projects.',
    features: ['Advanced simulation', 'AI insights', '5,000 requests per run', 'Priority email support', 'Latency distribution exports'],
    highlight: true,
  },
  {
    name: 'Team',
    price: '$199',
    period: '/mo',
    description: 'Unlimited capacity and collaboration for engineering teams.',
    features: ['Unlimited tests', 'Team collaboration', 'Custom alerts & webhooks', 'Dedicated account manager', 'SLA guarantees'],
    highlight: false,
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-background border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Pricing built for scale.
          </h2>
          <p className="text-lg text-[#9AA6C4] max-w-xl mx-auto">
            Transparent pricing that scales with your infrastructure needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative bg-[#081223]/70 rounded-[2rem] p-8 border backdrop-blur-xl hover:shadow-[0_0_40px_rgba(0,200,255,0.4)] transition-all duration-300 ${
                 tier.highlight ? 'border-[#00C8FF] shadow-[0_0_40px_rgba(0,200,255,0.15)] bg-gradient-to-b from-[#020c1b] to-[#081223]' : 'border-[#1EA7FF]/15'
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#00C8FF] text-[#020617] text-xs font-bold rounded-full tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-semibold text-white mb-2">{tier.name}</h3>
              <div className="text-[#9AA6C4] text-sm h-10 mb-6">{tier.description}</div>
              <div className="flex items-baseline gap-1 mb-8">
                 <span className="text-5xl font-bold text-white tracking-tight">{tier.price}</span>
                 {tier.period && <span className="text-[#9AA6C4] text-lg font-medium">{tier.period}</span>}
              </div>
              
              <button className={`w-full py-4 rounded-xl font-semibold transition-all mb-8 ${
                 tier.highlight 
                 ? 'bg-gradient-to-br from-[#00C8FF] to-[#1EA7FF] text-white shadow-lg' 
                 : 'bg-white/5 text-white border border-[#4DEBFF]/40 hover:shadow-[0_0_30px_rgba(0,200,255,0.3)]'
              }`}>
                 Get Started
              </button>

              <div className="space-y-4">
                 {tier.features.map(f => (
                   <div key={f} className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-[#00C8FF] shrink-0" />
                     <span className="text-[#9AA6C4] text-sm">{f}</span>
                   </div>
                 ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
