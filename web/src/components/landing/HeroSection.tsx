'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function HeroSection() {
  const [testPhone, setTestPhone] = useState('+8801700000000');
  const [testOtp, setTestOtp] = useState('748291');
  const [simulatedState, setSimulatedState] = useState<'idle' | 'transmitting' | 'sent'>('idle');

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedState('transmitting');
    setTimeout(() => {
      setSimulatedState('sent');
      setTimeout(() => setSimulatedState('idle'), 4000);
    }, 800);
  };

  return (
    <section className="relative border-b-3 border-[#1a1a1a] bg-[#fbf8f1] px-4 py-12 md:py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Headline & Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="burgundy" rotate="left">
              BREAKING DISPATCH
            </Badge>
            <span className="font-mono text-xs uppercase tracking-widest text-[#524d43]">
              TELEGRAPHIC COURIER FOR MODERN SOFTWARE
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-black text-[#1a1a1a] leading-[1.08] tracking-tight uppercase">
            A High-Velocity WhatsApp Gateway Without The Vendor Tax.
          </h2>

          <p className="font-serif text-lg text-[#524d43] leading-relaxed max-w-2xl">
            Deliver time-critical One-Time Passwords (OTPs), verification codes, and automated alerts directly through WhatsApp. Pair your device in 10 seconds via high-resolution QR or phone pairing code, mint secure cryptographic API keys, and transmit messages through a single REST call.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="shadow-[4px_4px_0px_#1a1a1a]">
                ENTER DISPATCH CONSOLE →
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg">
                REGISTER PRESS ACCOUNT
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-[#1a1a1a]">
            <div>
              <div className="font-mono text-2xl font-black text-[#7a2020]">&lt; 150ms</div>
              <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                Average Dispatch Latency
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-[#2e6930]">100%</div>
              <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                Native WhatsApp WebSockets
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

        {/* Right Column: Live Simulated Wire Terminal */}
        <div className="lg:col-span-5">
          <div className="border-3 border-[#1a1a1a] bg-[#f4efe2] shadow-[6px_6px_0px_#1a1a1a] relative">
            {/* Header Plate */}
            <div className="border-b-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-xs font-bold tracking-widest uppercase">
                TELEGRAPH TRANSMITTER MOCK-UP
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2e6930] animate-ping" />
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#ede3ce] border border-[#1a1a1a] p-3 text-xs font-mono text-[#524d43]">
                <span className="text-[#7a2020] font-bold">WIRE SPEC:</span> POST /send-otp
                <br />
                <span className="text-[#1a1a1a] font-bold">HEADER:</span> x-api-key: _ars_2k03_...
              </div>

              <form onSubmit={handleSimulate} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#1a1a1a] mb-1">
                    RECIPIENT TELEPHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fbf8f1] border-2 border-[#1a1a1a] font-mono text-sm focus:outline-none"
                    placeholder="+8801700000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#1a1a1a] mb-1">
                    VERIFICATION PIN / OTP CODE
                  </label>
                  <input
                    type="text"
                    value={testOtp}
                    onChange={(e) => setTestOtp(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fbf8f1] border-2 border-[#1a1a1a] font-mono text-sm font-bold tracking-widest focus:outline-none"
                    placeholder="123456"
                  />
                </div>

                <Button
                  type="submit"
                  variant="dark"
                  size="md"
                  className="w-full"
                  isLoading={simulatedState === 'transmitting'}
                >
                  {simulatedState === 'sent'
                    ? '✓ TELEGRAM DELIVERED TO RECIPIENT'
                    : 'TRANSMIT TEST TELEGRAM'}
                </Button>
              </form>

              {/* Wire output response */}
              <div className="bg-[#1a1a1a] text-[#84cc16] p-3 font-mono text-xs border border-[#1a1a1a] overflow-x-auto">
                <div className="text-[#a3a3a3]">// DISPATCH WIRE PACKET</div>
                <div>{`{`}</div>
                <div className="pl-4">
                  <span className="text-[#38bdf8]">&quot;statusCode&quot;</span>: 200,
                </div>
                <div className="pl-4">
                  <span className="text-[#38bdf8]">&quot;success&quot;</span>: true,
                </div>
                <div className="pl-4">
                  <span className="text-[#38bdf8]">&quot;messageId&quot;</span>:{' '}
                  <span className="text-[#fbbf24]">&quot;MSG_TEL_7A920F&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#38bdf8]">&quot;recipient&quot;</span>:{' '}
                  <span className="text-[#fbbf24]">&quot;{testPhone}&quot;</span>
                </div>
                <div>{`}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
