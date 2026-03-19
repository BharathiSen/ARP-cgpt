'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        return;
      }
    }

    const signInRes = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (signInRes?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-[#05070f] text-white selection:bg-[#00C8FF] selection:text-white section-gradient flex flex-col items-center justify-center p-6 lg:p-12">
      <Navbar />
      
      <div className="w-full max-w-xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 lg:p-16 border-[#00C8FF]/20 shadow-[0_0_50px_rgba(0,180,255,0.1)]"
        >
          <div className="text-center mb-12">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#00C8FF]/10 border border-[#00C8FF]/20 mb-8">
                <ShieldCheck className="w-10 h-10 text-[#00C8FF]" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
               {isRegister ? 'Join the Lab' : 'Authentication Portal'}
             </h1>
             <p className="text-[#9AA6C4] text-lg font-medium leading-relaxed">
               {isRegister ? 'Start building 100.0% reliable APIs' : 'Access your reliability control center'}
             </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {isRegister && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA6C4]/40">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="input-theme w-full pl-12 h-14"
                  placeholder="Your Full Name"
                  required
                />
              </div>
            )}
            <div className="relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA6C4]/40">
                  <Mail className="w-5 h-5" />
               </div>
               <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="input-theme w-full pl-12 h-14"
                placeholder="developer@work.com"
                required
              />
            </div>
            <div className="relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA6C4]/40">
                  <Lock className="w-5 h-5" />
               </div>
               <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="input-theme w-full pl-12 h-14"
                placeholder="••••••••••••"
                required
              />
            </div>
            
            {error && <p className="text-red-400 font-bold text-center text-sm">{error}</p>}
            
            <button 
              type="submit"
              className="btn-primary w-full h-16 text-lg tracking-wide uppercase font-bold"
            >
              {isRegister ? 'Create Account' : 'Authenticate Console'}
            </button>
            <p className="text-center text-sm font-bold text-[#9AA6C4]/40 tracking-widest pt-4">
              {isRegister ? 'ALREADY A MEMBER?' : "NEED ACCESS?"}{' '}
              <button 
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#00C8FF] hover:text-[#4DEBFF] hover:underline underline-offset-8 transition-colors"
              >
                {isRegister ? 'SIGN IN' : 'REGISTER NOW'}
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
