'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function DocsNavbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fbf8f1] border-b-2 border-[#1a1a1a]">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4 relative">
        {/* Brand & Docs Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <span className="font-serif font-black text-xl sm:text-2xl text-[#1a1a1a] tracking-tight group-hover:text-[#7a2020] transition-colors">
              WA Gateway
            </span>
          </Link>
          <span className="text-[#524d43] font-mono text-sm select-none">/</span>
          <Badge variant="burgundy" className="tracking-wider">
            DOCS
          </Badge>
        </div>

        {/* Right CTA Links */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" className="hidden sm:block">
            <Button variant="outline" size="sm" className="text-xs py-1.5 px-3">
              ← Website
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                variant="emerald"
                size="sm"
                className="text-xs py-1.5 px-3 shadow-[2px_2px_0px_#1a1a1a]"
              >
                Dashboard →
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button
                variant="primary"
                size="sm"
                className="text-xs py-1.5 px-3 shadow-[2px_2px_0px_#1a1a1a]"
              >
                Get API Key
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default DocsNavbar;
