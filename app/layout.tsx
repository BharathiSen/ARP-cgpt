import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
