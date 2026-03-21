'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { useState } from 'react';

export default function Pricing() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        console.error('Razorpay SDK failed to load');
        setIsUpgrading(false);
        return;
      }

      const orderRes = await fetch('/api/razorpay/order', { method: 'POST' });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.id) {
        console.error('Failed to create Razorpay order');
        setIsUpgrading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AI Reliability Lab',
        description: 'Pro Subscription',
        order_id: orderData.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              await update(); // refresh session
              router.push('/success');
            } else {
              console.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Error during verification:', err);
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment Failed:', response.error);
      });
      rzp.open();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Restricted Access</h1>
        <p className="text-zinc-400 text-center mb-8">
          You need an active subscription to access the dashboard and core features of the AI Reliability Lab.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-zinc-300">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span>Full API Simulation Suite</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span>Advanced Analytics Dashboard</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span>Priority Support</span>
          </div>
        </div>

        <Button 
          onClick={handleUpgrade} 
          disabled={isUpgrading}
          className="w-full h-12 text-lg font-medium"
        >
          {isUpgrading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
          ) : null}
          {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
        </Button>
      </motion.div>
    </div>
  );
}