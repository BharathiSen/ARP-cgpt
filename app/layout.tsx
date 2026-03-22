import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Reliability Lab | Production-Ready API Stress Testing',
  description: 'Test API reliability before production with AI-powered system analysis. Minimal SaaS for modern engineering teams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-[#05070f]`}>
        <Providers>
          <Navbar />
          {children}
          <Toaster 
            position="bottom-right" 
            toastOptions={{ 
              style: { 
                background: '#0a0f1c', 
                color: '#fff', 
                border: '1px solid #1e293b' 
              },
              success: { iconTheme: { primary: '#00C8FF', secondary: '#0a0f1c' } }
            }} 
          />
        </Providers>
      </body>
    </html>
  );
}
