'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CTA() {
  return (
    <section className="ds-section relative overflow-hidden">
      {/* Glow */}
      <div className="ds-glow-orb w-[700px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0.18 }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8"
               style={{ background: 'rgba(0,200,255,0.10)', border: '1px solid rgba(0,200,255,0.25)' }}>
            <Play className="w-8 h-8 fill-current" style={{ color: '#00C8FF' }} />
          </div>

          <h2 className="ds-heading text-5xl md:text-7xl mb-6">
            Build Reliable APIs<br />With Confidence.
          </h2>

          <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: '#9AA6C4' }}>
            Join thousands of engineers who trust AI Reliability Lab to uncover hidden flaws before they hit production.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Button href="/login" className="text-base px-6 py-3">
              Start Testing Your API
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="ghost" href="/dashboard" className="text-base px-6 py-3">
              Run Your First Simulation
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
