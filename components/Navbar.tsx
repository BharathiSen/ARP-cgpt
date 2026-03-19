'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/Button';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Features', href: '/#features' },
    { name: 'Demo', href: '/#demo' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Docs', href: '/#docs' },
    { name: 'Pricing', href: '/#pricing' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 transition-all duration-300"
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
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#9AA6C4' }}>
          {links.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-white transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard" className={`text-sm transition-colors hover:text-white ${pathname === '/dashboard' ? 'text-white border-b-2 border-[#00C8FF] pb-1' : ''}`} style={{ color: pathname === '/dashboard' ? '#fff' : '#9AA6C4' }}>
                Dashboard
              </Link>
              <Button
                variant="ghost"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm px-4 py-2"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: '#9AA6C4' }}>
                Sign In
              </Link>
              <Button href="/dashboard" className="text-sm px-5 py-2.5">
                Start Testing
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-[#9AA6C4] hover:text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 p-6 flex flex-col gap-4 shadow-xl" style={{ background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(0,200,255,0.08)' }}>
          {links.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="text-[#9AA6C4] hover:text-white transition-colors text-sm font-medium"
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px w-full my-2 bg-[rgba(0,200,255,0.1)]" />
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className={`text-sm ${pathname === '/dashboard' ? 'text-white' : 'text-[#9AA6C4]'} hover:text-white`}>
                Dashboard
              </Link>
              <button
                onClick={() => { setIsOpen(false); signOut({ callbackUrl: '/' }); }}
                className="text-left text-sm text-[#ff4d4d] hover:text-[#ff7070]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-sm text-[#9AA6C4] hover:text-white">
                Sign In
              </Link>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="ds-btn-primary w-full text-center py-2.5 mt-2">
                Start Testing
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

