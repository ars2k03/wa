'use client';

import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CodePreview } from '@/components/landing/CodePreview';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1a1a]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <CodePreview />
      </main>
      <Footer />
    </div>
  );
}
