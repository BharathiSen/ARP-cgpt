import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 backdrop-blur-lg bg-[#020c1b]/60 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-[#00C8FF]/10 rounded-xl group-hover:bg-[#00C8FF]/20 transition-colors">
            <Activity className="w-5 h-5 text-[#00C8FF]" />
          </div>
          <span className="font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#4DEBFF]">
            AI Reliability Lab
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#demo" className="hover:text-white transition-colors">Demo</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#docs" className="hover:text-white transition-colors">Docs</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-sm text-[#9AA6C4] hover:text-white transition-colors">
            Sign In
          </Link>
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#00C8FF] to-[#1EA7FF] rounded-lg hover:shadow-[0_0_40px_rgba(0,200,255,0.4)] transition-all">
            Start Testing
          </button>
        </div>
      </div>
    </nav>
  );
}
