'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

const STEPS = [
  {
    step: 'STEP 01',
    title: 'Create Account',
    detail:
      'Sign up in seconds with your email or log in to access your developer dashboard, session management, and API keys.',
    badge: '1. REGISTER / LOGIN',
  },
  {
    step: 'STEP 02',
    title: 'Scan QR Code',
    detail:
      'Link your WhatsApp account in seconds. Simply scan the rendered high-resolution QR code directly from your phone.',
    badge: '2. LINK DEVICE',
  },
  {
    step: 'STEP 03',
    title: 'Get API Key',
    detail:
      'Generate a cryptographically secure API key from your dashboard. Configure endpoint permissions and webhooks instantly.',
    badge: '3. GET API KEY',
  },
  {
    step: 'STEP 04',
    title: 'Send Messages',
    detail:
      'Make a simple HTTP POST request to send OTPs, notifications, and customer messages with sub-second delivery latency.',
    badge: '4. SEND MESSAGES',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b-2 border-[#1a1a1a] bg-[#fbf8f1] px-4 py-16">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="font-mono text-xs font-bold text-[#7a2020] uppercase tracking-wider">
            Simple 4-Step Setup
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#1a1a1a] tracking-tight">
            How WA Gateway Works
          </h2>
          <p className="font-serif text-base text-[#524d43]">
            From registration to sending your first automated WhatsApp message in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative items-stretch">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="border-2 border-[#1a1a1a] bg-[#f4efe2] p-6 shadow-[4px_4px_0px_#1a1a1a] flex flex-col justify-between relative h-full min-h-[260px]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] pb-2">
                  <span className="font-mono text-xs font-black text-[#7a2020] tracking-wider">
                    {step.step}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#1a1a1a] bg-[#ede5d3] px-2 py-0.5 border border-[#1a1a1a]">
                    {step.badge}
                  </span>
                </div>
                <h3 className="font-serif font-black text-xl text-[#1a1a1a] tracking-tight">
                  {step.title}
                </h3>
                <p className="font-serif text-sm text-[#524d43] leading-relaxed">
                  {step.detail}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1a1a1a] text-xs font-mono text-[#1a1a1a] flex items-center justify-between">
                <span>PHASE 0{idx + 1} OF 04</span>
                <span className="font-bold text-[#2e6930]">READY</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
