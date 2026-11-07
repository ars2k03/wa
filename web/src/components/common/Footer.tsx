'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-[#f4efe2] border-t-2 border-[#1a1a1a] px-4 py-6 sm:py-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Brand & Status */}
        <div className="flex items-center gap-2.5">
          <span className="font-serif font-black text-lg sm:text-xl text-[#1a1a1a] tracking-tight">
            WA Gateway
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#eaf3eb] text-[#2e6930] border border-[#1a1a1a] select-none">
            <span className="w-2 h-2 rounded-full bg-[#2e6930] animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Copyright */}
        <p className="font-mono text-xs text-[#524d43]">
          © 2026 WA Gateway. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
