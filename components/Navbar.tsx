'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12"
         style={{ background: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(0,200,255,0.08)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl transition-colors" style={{ background: 'rgba(0,200,255,0.10)' }}>
            <Activity className="w-5 h-5" style={{ color: '#00C8FF' }} />
          </div>
          <span className="font-bold tracking-wide ds-gradient-text text-[15px]">
            AI Reliability Lab
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#9AA6C4' }}>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#demo" className="hover:text-white transition-colors">Demo</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#docs" className="hover:text-white transition-colors">Docs</Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard" className="hidden md:block text-sm transition-colors hover:text-white" style={{ color: '#9AA6C4' }}>
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ds-btn-ghost text-sm px-4 py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block text-sm transition-colors hover:text-white" style={{ color: '#9AA6C4' }}>
                Sign In
              </Link>
              <Link href="/login" className="ds-btn-primary text-sm px-5 py-2.5">
                Start Testing
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
