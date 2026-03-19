'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }
    }

    const signInRes = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      setError('Invalid credentials. Please try again.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="ds-glow-orb w-[700px] h-[700px] top-[-200px] left-1/2 -translate-x-1/2" />
      </div>

      <div className="pt-32 pb-20 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,200,255,0.12)' }}>
              <Activity className="w-6 h-6" style={{ color: '#00C8FF' }} />
            </div>
            <span className="font-bold text-lg ds-gradient-text">AI Reliability Lab</span>
          </div>

          <div className="ds-card p-10">
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-center text-sm mb-8" style={{ color: '#9AA6C4' }}>
              {isRegister ? 'Start testing API reliability for free.' : 'Sign in to your developer dashboard.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="ds-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="ds-input"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              <div>
                <label className="ds-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ds-input"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="ds-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ds-input"
                  placeholder="••••••••••"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-center rounded-lg py-2.5 px-4"
                     style={{ background: 'rgba(255,50,50,0.10)', border: '1px solid rgba(255,50,50,0.25)', color: '#ff7070' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="ds-btn-primary w-full justify-center mt-2"
              >
                {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm" style={{ color: '#9AA6C4' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="font-semibold transition-colors hover:opacity-80"
                style={{ color: '#00C8FF' }}
              >
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#9AA6C4' }}>
            By continuing, you agree to our{' '}
            <Link href="#" className="hover:text-white transition-colors" style={{ color: '#00C8FF' }}>Terms</Link>
            {' '}and{' '}
            <Link href="#" className="hover:text-white transition-colors" style={{ color: '#00C8FF' }}>Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
