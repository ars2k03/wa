'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

const STEPS = [
  {
    step: 'STAGE I',
    title: 'INSCRIBE ACCOUNT & MINT KEY',
    detail:
      'Register your operator credentials in the console. Issue a cryptographically secure key prefixed with _ars_2k03_ with one click.',
    stamp: 'STEP 1: KEYS',
  },
  {
    step: 'STAGE II',
    title: 'PAIR WHATSAPP APPARATUS',
    detail:
      'Initialize a session and scan the rendered high-contrast QR code on your phone, or request an 8-digit numerical pairing code directly.',
    stamp: 'STEP 2: LINK',
  },
  {
    step: 'STAGE III',
    title: 'TRANSMIT INSTANT TELEGRAMS',
    detail:
      'Dispatch HTTP POST requests with recipient phone numbers and OTP payloads. Monitor delivery outcomes in the live audit ledger.',
    stamp: 'STEP 3: DISPATCH',
  },
];

export function HowItWorks() {
  return (
    <section className="border-b-3 border-[#1a1a1a] bg-[#fbf8f1] px-4 py-16">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="font-mono text-xs font-bold text-[#7a2020] uppercase tracking-widest">
            SECTION III: OPERATING MANUAL
          </div>
          <h3 className="font-serif text-3xl sm:text-5xl font-black text-[#1a1a1a] uppercase tracking-tight">
            THREE STEPS TO FULL COMMISSION
          </h3>
          <p className="font-serif text-sm sm:text-base text-[#524d43]">
            Go from initial configuration to live transactional dispatch in under three minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="border-2 border-[#1a1a1a] bg-[#f4efe2] p-6 shadow-[4px_4px_0px_#1a1a1a] flex flex-col justify-between relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#1a1a1a] pb-2">
                  <span className="font-mono text-xs font-black text-[#7a2020] tracking-widest">
                    {step.step}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1a1a1a] bg-[#ede5d3] px-2 py-0.5 border border-[#1a1a1a]">
                    {step.stamp}
                  </span>
                </div>
                <h4 className="font-serif font-black text-xl text-[#1a1a1a] uppercase tracking-tight">
                  {step.title}
                </h4>
                <p className="font-serif text-sm text-[#524d43] leading-relaxed">
                  {step.detail}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1a1a1a] text-xs font-mono text-[#1a1a1a] flex items-center justify-between">
                <span>PHASE: 0{idx + 1} OF 03</span>
                <span className="font-bold text-[#2e6930]">READY</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="shadow-[4px_4px_0px_#1a1a1a]">
              COMMENCE PAIRING NOW →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
