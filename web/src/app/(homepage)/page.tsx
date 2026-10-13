'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CodePreview } from '@/components/landing/CodePreview';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <CodePreview />
    </>
  );
}
