'use client';

import React from 'react';
import { useDashboardTab, type DashboardTab } from '@/context/DashboardTabContext';

interface SidebarItem {
  id: DashboardTab;
  title: string;
  icon: React.ReactNode;
}

const ITEMS: SidebarItem[] = [
  {
    id: 'device',
    title: 'WhatsApp Device',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'keys',
    title: 'API Keys',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
        />
      </svg>
    ),
  },
  {
    id: 'tester',
    title: 'Live Message Test',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    id: 'logs',
    title: 'Message Ledger',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

export function DashboardSidebar() {
  const { activeTab, setActiveTab } = useDashboardTab();

  return (
    <aside className="w-full md:w-64 shrink-0 bg-[#f4efe2] border-b-2 md:border-b-0 md:border-r-2 border-[#1a1a1a] flex flex-col justify-between h-full overflow-hidden select-none">
      {/* Top Navigation Items */}
      <div className="p-4 space-y-4">
        <div className="hidden md:block border-b-2 border-[#1a1a1a] pb-2">
          <span className="font-mono text-[10px] font-black uppercase text-[#7a2020] tracking-widest">
            NAVIGATION DESK
          </span>
        </div>

        {/* Menu Buttons */}
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 p-3 text-left transition-all cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-[#fbf8f1] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#7a2020] translate-x-0'
                    : 'bg-transparent text-[#524d43] hover:bg-[#ede5d3] hover:text-[#1a1a1a] border-2 border-transparent hover:border-[#1a1a1a]'
                }`}
              >
                <span className={isActive ? 'text-[#7a2020]' : 'text-[#524d43]'}>
                  {item.icon}
                </span>
                <span className="font-serif font-bold text-xs sm:text-sm tracking-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sticky Status Info */}
      <div className="hidden md:block p-4 border-t-2 border-[#1a1a1a] bg-[#ede5d3] space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-[#524d43]">
          <span>GATEWAY:</span>
          <span className="font-bold text-[#1a1a1a]">ONLINE</span>
        </div>
        <div className="flex items-center justify-between text-[#524d43]">
          <span>CAPACITY:</span>
          <span className="font-bold text-[#2e6930]">1 DEVICE</span>
        </div>
        <div className="pt-2 border-t border-[#1a1a1a]/20 text-[10px] text-[#524d43]">
          WHATSAPP GATEWAY • REST v1.0
        </div>
      </div>
    </aside>
  );
}
