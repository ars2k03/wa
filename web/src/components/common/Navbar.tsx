'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [gatewayOnline, setGatewayOnline] = useState<boolean | null>(null);
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    );

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

  return (
    <header className="w-full bg-[#fbf8f1] border-b-2 border-[#1a1a1a]">
      {/* Top Newsprint Ticker Bar */}
      <div className="border-b border-[#1a1a1a] px-4 py-1.5 text-xs font-mono flex flex-wrap items-center justify-between gap-2 text-[#524d43] bg-[#f4efe2]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#1a1a1a]">EDITION: SPECIAL BROADSHEET</span>
          <span>•</span>
          <span>{currentDateStr || 'Tuesday, 13 October 2026'}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                gatewayOnline === true
                  ? 'bg-[#2e6930] animate-pulse'
                  : gatewayOnline === false
                  ? 'bg-[#7a2020]'
                  : 'bg-[#b45309]'
              }`}
            />
            <span className="font-bold text-[#1a1a1a]">
              {gatewayOnline === true
                ? 'GATEWAY ONLINE :3002'
                : gatewayOnline === false
                ? 'GATEWAY OFFLINE'
                : 'CHECKING LINK...'}
            </span>
          </div>
          <span>•</span>
          <span className="hidden sm:inline">HIGH-VELOCITY BAILEYS ENGINE</span>
        </div>
      </div>

      {/* Broadsheet Masthead Header */}
      <div className="px-4 py-6 md:py-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative">
        <Link href="/" className="group inline-block">
          <p className="text-[11px] sm:text-xs font-mono tracking-[0.3em] uppercase text-[#7a2020] font-bold mb-1">
            ★ MULTI-TENANT CRYPTOGRAPHIC TELEGRAPH ★
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#1a1a1a] uppercase drop-shadow-xs group-hover:text-[#7a2020] transition-colors">
            THE TELEGRAPHIC DISPATCH
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-[#524d43] mt-1 max-w-xl mx-auto">
            Official Gazette of High-Throughput WhatsApp Notifications, OTP Dispatches & Automated Messaging
          </p>
        </Link>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-t-2 border-b-2 border-[#1a1a1a] bg-[#f4efe2] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <nav className="flex items-center space-x-1 sm:space-x-4">
            <Link
              href="/"
              className={`px-3 py-1.5 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all border-2 ${
                pathname === '/'
                  ? 'bg-[#1a1a1a] text-[#fbf8f1] border-[#1a1a1a] shadow-[2px_2px_0px_#524d43]'
                  : 'bg-transparent text-[#1a1a1a] border-transparent hover:border-[#1a1a1a] hover:bg-[#ede5d3]'
              }`}
            >
              FRONT PAGE
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all border-2 ${
                pathname === '/dashboard'
                  ? 'bg-[#1a1a1a] text-[#fbf8f1] border-[#1a1a1a] shadow-[2px_2px_0px_#524d43]'
                  : 'bg-transparent text-[#1a1a1a] border-transparent hover:border-[#1a1a1a] hover:bg-[#ede5d3]'
              }`}
            >
              DISPATCH CONSOLE
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Badge variant="emerald" rotate="left">
                  USER: {user?.name || user?.email?.split('@')[0]}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-xs py-1 px-2.5"
                >
                  SIGN OUT
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs py-1 px-3">
                    LOG IN
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="text-xs py-1 px-3">
                    REGISTER
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
