'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Button } from '@/components/Button';
import { FakePaymentModal } from '@/components/FakePaymentModal';

export default function UpgradeLock() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = async () => {
    try {
      const res = await fetch('/api/upgrade', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/dashboard';
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#05070f]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-[#00C8FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-[#00C8FF]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">🔒 Access Restricted</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Upgrade to access API simulations, custom endpoint testing, and AI-driven reliability insights.
        </p>
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-[var(--neon-blue)] to-blue-500 rounded-xl"
        >
          Upgrade to Pro →
        </Button>
      </motion.div>
      
      <FakePaymentModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={handleSuccess}
      />
    </div>
  );
}
