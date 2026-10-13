'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '../ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [gatewayOnline, setGatewayOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Check backend health
    api
      .getStatus()
      .then(() => setGatewayOnline(true))
      .catch(() => setGatewayOnline(false));

    const interval = setInterval(() => {
      api
        .getStatus()
        .then(() => setGatewayOnline(true))
        .catch(() => setGatewayOnline(false));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };

  const handleSectionScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `#${targetId}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fbf8f1] border-b-2 border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 relative">
        {/* Brand & Status (Left) */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group shrink-0 cursor-pointer"
        >
          <span className="font-serif font-black text-xl sm:text-2xl text-[#1a1a1a] tracking-tight group-hover:text-[#7a2020] transition-colors">
            WA Gateway
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-[#1a1a1a] select-none ${
              gatewayOnline === true
                ? 'bg-[#eaf3eb] text-[#2e6930]'
                : gatewayOnline === false
                ? 'bg-[#fae8e8] text-[#7a2020]'
                : 'bg-[#fef3c7] text-[#b45309]'
            }`}
            title={
              gatewayOnline === true
                ? 'Gateway service online'
                : gatewayOnline === false
                ? 'Gateway offline'
                : 'Checking status...'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                gatewayOnline === true
                  ? 'bg-[#2e6930] animate-pulse'
                  : gatewayOnline === false
                  ? 'bg-[#7a2020]'
                  : 'bg-[#b45309]'
              }`}
            />
            <span className="hidden sm:inline">
              {gatewayOnline === true ? 'OPERATIONAL' : gatewayOnline === false ? 'OFFLINE' : 'CHECKING'}
            </span>
          </span>
        </Link>

        {/* Navigation Links (Centered in Middle) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider text-[#524d43] absolute left-1/2 -translate-x-1/2">
          <a
            href="/#how-it-works"
            onClick={(e) => handleSectionScroll(e, 'how-it-works')}
            className="hover:text-[#1a1a1a] hover:underline transition-colors cursor-pointer"
          >
            How It Works
          </a>
          <a
            href="/#docs"
            onClick={(e) => handleSectionScroll(e, 'docs')}
            className="hover:text-[#1a1a1a] hover:underline transition-colors cursor-pointer"
          >
            Docs
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="emerald" size="sm" className="text-xs py-1.5 px-3">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-xs py-1.5 px-3"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-xs py-1.5 px-3 sm:px-4">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="text-xs py-1.5 px-3 sm:px-4">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
