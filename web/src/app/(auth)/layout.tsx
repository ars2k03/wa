import React from 'react';
import Link from 'next/link';
import { Footer } from '@/components/common/Footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1a1a]">
      {/* Clean Minimalist Auth Header */}
      <header className="sticky top-0 z-50 w-full bg-[#fbf8f1] border-b-2 border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <span className="font-serif font-black text-xl sm:text-2xl text-[#1a1a1a] tracking-tight group-hover:text-[#7a2020] transition-colors">
              WA Gateway
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-mono font-bold text-[#524d43] hover:text-[#1a1a1a] hover:underline uppercase transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">{children}</main>
      <Footer />
    </div>
  );
}
