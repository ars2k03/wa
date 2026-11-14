'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TerminalDemo } from './TerminalDemo';

export function HeroSection() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://wapi.ars2k03.tech'
      : 'http://localhost:3002');

  return (
    <section className="relative border-b-2 border-[#1a1a1a] bg-[#fbf8f1] px-4 py-12 md:py-18">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Headlines, Copy & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="burgundy">Modern</Badge>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-black text-[#1a1a1a] leading-[1.08] tracking-tight">
            WhatsApp API for Developers
          </h1>

          <p className="font-serif text-lg text-[#524d43] leading-relaxed max-w-2xl">
            Connect in seconds, generate API keys, and automate OTPs &amp; alerts via simple REST endpoints. Built for reliability without high vendor pricing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/register">
              <Button variant="primary" size="lg" className="shadow-[4px_4px_0px_#1a1a1a]">
                Get Started Free →
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">
                Read Docs →
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-[#1a1a1a]">
            <div>
              <div className="font-mono text-2xl font-black text-[#7a2020]">&lt; 150ms</div>
              <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                Average Latency
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-[#2e6930]">99.9%</div>
              <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                System Uptime
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-[#1a1a1a]">ZERO</div>
              <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                Per-Message Markups
              </div>
            </div>
          </div>
        </div>
        {/* Right Column: Animated Terminal Demo */}
        <div className="lg:col-span-5">
          <TerminalDemo apiUrl={apiUrl} />
        </div>
      </div>
    </section>
  );
}
