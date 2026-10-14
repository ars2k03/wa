import React from 'react';
import type { Metadata } from 'next';
import { DocsNavbar } from '@/components/docs/Navbar';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { Footer } from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'API Documentation | WA Gateway for Developers',
  description:
    'Quickstart, authentication, the /send-otp API reference, and error codes for WA Gateway.',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1a1a] [--docs-sidebar-w:240px]">
      <DocsNavbar />
      {/* Sidebar is fixed on large screens; only this column (page + footer) scrolls. */}
      <DocsSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[var(--docs-sidebar-w)]">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
