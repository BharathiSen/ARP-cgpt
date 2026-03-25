'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SuccessPage() {
  const { status, update } = useSession();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const refreshSession = async () => {
        await update();
        setIsUpdating(false);
      };
      refreshSession();
    }
  }, [status, router, update]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-zinc-400 mb-8">
          Thank you for upgrading to AI Reliability Lab Pro. Your account has been upgraded and you now have full access.
        </p>

        <Button 
          onClick={() => router.push('/dashboard')} 
          disabled={isUpdating}
          className="w-full h-12 text-lg font-medium"
        >
          {isUpdating ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
          ) : null}
          {isUpdating ? 'Unlocking your account...' : 'Go to Dashboard'}
          {!isUpdating && <ArrowRight className="w-5 h-5 ml-2 inline" />}
        </Button>
      </motion.div>
    </div>
  );
}
