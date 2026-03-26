"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, Loader2, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface FakePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_STEPS = [
  "Connecting to secure payment gateway...",
  "Processing transaction...",
  "Verifying payment...",
];

export function FakePaymentModal({
  isOpen,
  onClose,
  onSuccess,
}: FakePaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setStepIndex(0);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handlePay = async () => {
    setIsProcessing(true);

    // Step 1
    setStepIndex(0);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Step 2
    setStepIndex(1);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3
    setStepIndex(2);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Success
    setIsSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            {/* Close Button */}
            {!isProcessing && !isSuccess && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="p-6">
              {!isProcessing && !isSuccess ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#00C8FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-[#00C8FF]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Pro Plan
                    </h2>
                    <div className="text-3xl font-bold text-[#00C8FF]">
                      ₹499
                      <span className="text-lg text-gray-400 font-normal">
                        /mo
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#00C8FF]" />
                      <span>Unlimited API tests</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#00C8FF]" />
                      <span>AI insights & advanced analytics</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#00C8FF]" />
                      <span>Priority support</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePay}
                    className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[var(--neon-blue)] to-blue-500 hover:opacity-90 rounded-xl"
                  >
                    Pay Securely
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Secure payment (Demo Mode)</span>
                  </div>
                </>
              ) : isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ✅ Payment Successful
                  </h2>
                  <p className="text-gray-400">
                    Welcome to Pro 🎉 Redirecting to dashboard...
                  </p>
                </motion.div>
              ) : (
                <div className="py-12 text-center">
                  <Loader2 className="w-12 h-12 text-[#00C8FF] animate-spin mx-auto mb-6" />
                  <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-8"
                  >
                    <p className="text-lg text-white font-medium">
                      {PAYMENT_STEPS[stepIndex]}
                    </p>
                  </motion.div>
                  <p className="text-sm text-gray-500 mt-4">
                    Please do not close this window
                  </p>
                </div>
              )}
            </div>

            {/* Top gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00C8FF] to-transparent opacity-50" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
