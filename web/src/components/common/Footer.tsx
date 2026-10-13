'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-[#f4efe2] border-t-3 border-[#1a1a1a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b-2 border-[#1a1a1a]">
          {/* Col 1: Masthead Info */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-serif font-black text-xl text-[#1a1a1a] uppercase tracking-tight">
              THE TELEGRAPHIC DISPATCH
            </h4>
            <p className="font-serif text-sm text-[#524d43] leading-relaxed max-w-md">
              A high-velocity, multi-tenant WhatsApp Gateway engineered for instant OTP delivery, transactional notifications, and resilient developer integration without proprietary vendor lock-in.
            </p>
            <div className="font-mono text-xs text-[#7a2020] font-bold tracking-wider">
              PRINTED & PUBLISHED VIA BAILEYS PROTOCOL & NEXT.JS APP ROUTER
            </div>
          </div>

          {/* Col 2: Fast Navigation */}
          <div className="space-y-2">
            <h5 className="font-mono text-xs font-black uppercase tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1">
              DISPATCH DIRECTORY
            </h5>
            <ul className="space-y-1.5 text-sm font-serif">
              <li>
                <Link href="/" className="hover:text-[#7a2020] hover:underline">
                  Front Page & Gazette
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#7a2020] hover:underline">
                  Telegraph Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#7a2020] hover:underline">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#7a2020] hover:underline">
                  Register Press Card
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Specifications */}
          <div className="space-y-2">
            <h5 className="font-mono text-xs font-black uppercase tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1">
              SPECIFICATIONS
            </h5>
            <div className="font-mono text-xs text-[#524d43] space-y-1">
              <div>PROTOCOL: Baileys WebSockets</div>
              <div>STATE ENGINE: Upstash Redis</div>
              <div>DATABASE: Supabase PostgreSQL</div>
              <div>PORT: 3002 (API) / 3000 (UI)</div>
              <div>DESIGN: Editorial Brutalism</div>
            </div>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#524d43] gap-2 text-center sm:text-left">
          <div>
            © 2026 THE TELEGRAPHIC DISPATCH. ALL RIGHTS RESERVED.
          </div>
          <div className="tracking-widest uppercase font-bold text-[#1a1a1a]">
            BROADSHEET EDITION NO. 104 • HIGH RELIABILITY GATEWAY
          </div>
        </div>
      </div>
    </footer>
  );
}
