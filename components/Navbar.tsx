'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 backdrop-blur-xl bg-[#020c1b]/60 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-[#00C8FF]/10 rounded-xl group-hover:bg-[#00C8FF]/20 transition-colors">
            <Activity className="w-5 h-5 text-[#00C8FF]" />
          </div>
          <span className="font-bold tracking-tight text-white group-hover:text-gradient transition-all duration-300">
            AI Reliability Lab
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9AA6C4]">
           <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
           <Link href="/#demo" className="hover:text-white transition-colors">Demo</Link>
           <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
           <Link href="/#docs" className="hover:text-white transition-colors">Docs</Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-bold text-gradient">
                Dashboard
              </Link>
              <button 
                onClick={() => signOut()}
                className="text-sm text-[#9AA6C4] hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden md:block text-sm font-medium text-[#9AA6C4] hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-[#00C8FF] to-[#1EA7FF] rounded-xl hover:shadow-[0_0_30px_rgba(0,200,255,0.4)] transition-all">
                Start Testing
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
