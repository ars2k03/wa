import React from 'react';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';
import { Footer } from '@/components/common/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1a1a]">
      <DashboardNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
