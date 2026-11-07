'use client';

import React from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      
      {/* Bottom Editorial Call to Action */}
      <section className="border-b-2 border-[#1a1a1a] bg-[#ede5d3] px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="font-mono text-xs font-bold text-[#7a2020] uppercase tracking-wider">
            DEVELOPER-FIRST GATEWAY
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#1a1a1a] tracking-tight">
            Ready to automate your WhatsApp alerts?
          </h2>
          <p className="font-serif text-base text-[#524d43] max-w-xl mx-auto">
            Connect in seconds, generate your API key, and start dispatching verification codes &amp; notifications with sub-second delivery.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link href="/register">
              <Button variant="primary" size="lg" className="shadow-[4px_4px_0px_#1a1a1a]">
                Get Started Free →
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">
                Explore Full Docs →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
