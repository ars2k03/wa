import React from 'react';
import type { Metadata } from 'next';
import { DocsNavbar } from '@/components/docs/Navbar';
import { Footer } from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'API Documentation | WA Gateway for Developers',
  description:
    'Comprehensive REST API documentation, quickstart guides, interactive code playground, and authentication specs for WA Gateway.',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1a1a]">
      <DocsNavbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
