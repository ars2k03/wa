import React from 'react';
import { DashboardTabProvider } from '@/context/DashboardTabContext';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardTabProvider>
      <div className="h-screen w-full flex flex-col bg-[#fbf8f1] text-[#1a1a1a] overflow-hidden">
        {/* Full-width Top Navbar (Aliged edge-to-edge) */}
        <DashboardNavbar />

        {/* Workstation Body: Fixed Stable Sidebar + Independent Scrollable Middle Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <DashboardSidebar />
          {/* relative: absolutely positioned children (e.g. sr-only tables) stay inside this scroll area
              instead of stretching the page and making the sidebar scroll with it */}
          <main className="relative flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardTabProvider>
  );
}
