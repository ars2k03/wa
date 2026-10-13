'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';

import { DeviceConnectTab } from '@/components/dashboard/DeviceConnectTab';
import { ApiKeyManagerTab } from '@/components/dashboard/ApiKeyManagerTab';
import { MessageTesterTab } from '@/components/dashboard/MessageTesterTab';
import { MessageLogsTab } from '@/components/dashboard/MessageLogsTab';
import { DeveloperDocsTab } from '@/components/dashboard/DeveloperDocsTab';

type TabType = 'device' | 'keys' | 'tester' | 'logs' | 'docs';

function DashboardContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('device');
  const [activeKeyForTester, setActiveKeyForTester] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#1a1a1a] border-t-[#7a2020] rounded-full animate-spin" />
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#524d43]">
          VERIFYING DISPATCH CREDENTIALS...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const effectiveUserId = user.id;

  const handleKeySelected = (key: string) => {
    setActiveKeyForTester(key);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Console Masthead Banner */}
      <div className="border-3 border-[#1a1a1a] bg-[#ede5d3] p-6 shadow-[6px_6px_0px_#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase text-[#7a2020] tracking-widest">
              OFFICIAL OPERATOR CONTROL DESK
            </span>
            <Badge variant="emerald" rotate="right">
              AUTHENTICATED
            </Badge>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#1a1a1a] uppercase tracking-tight">
            DISPATCH STATION: {user.name || user.email}
          </h2>
          <p className="font-serif text-xs sm:text-sm text-[#524d43]">
            Targeting High-Velocity Gateway running on <span className="font-mono font-bold text-[#1a1a1a]">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}</span>
          </p>
        </div>
      </div>

      {/* Tab Navigation Navigation Bar */}
      <div className="border-b-3 border-[#1a1a1a] flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('device')}
          className={`px-4 py-3 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-t-2 border-x-2 border-[#1a1a1a] transition-all cursor-pointer ${
            activeTab === 'device'
              ? 'bg-[#fbf8f1] text-[#1a1a1a] shadow-[0px_-2px_0px_#7a2020] -mb-[3px] border-b-3 border-b-[#fbf8f1] z-10'
              : 'bg-[#ede5d3] text-[#524d43] hover:bg-[#f4efe2]'
          }`}
        >
          1. APPARATUS LINK (QR)
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-3 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-t-2 border-x-2 border-[#1a1a1a] transition-all cursor-pointer ${
            activeTab === 'keys'
              ? 'bg-[#fbf8f1] text-[#1a1a1a] shadow-[0px_-2px_0px_#7a2020] -mb-[3px] border-b-3 border-b-[#fbf8f1] z-10'
              : 'bg-[#ede5d3] text-[#524d43] hover:bg-[#f4efe2]'
          }`}
        >
          2. API KEY CONSOLE
        </button>

        <button
          onClick={() => setActiveTab('tester')}
          className={`px-4 py-3 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-t-2 border-x-2 border-[#1a1a1a] transition-all cursor-pointer ${
            activeTab === 'tester'
              ? 'bg-[#fbf8f1] text-[#1a1a1a] shadow-[0px_-2px_0px_#7a2020] -mb-[3px] border-b-3 border-b-[#fbf8f1] z-10'
              : 'bg-[#ede5d3] text-[#524d43] hover:bg-[#f4efe2]'
          }`}
        >
          3. LIVE TESTER (OTP)
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-t-2 border-x-2 border-[#1a1a1a] transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-[#fbf8f1] text-[#1a1a1a] shadow-[0px_-2px_0px_#7a2020] -mb-[3px] border-b-3 border-b-[#fbf8f1] z-10'
              : 'bg-[#ede5d3] text-[#524d43] hover:bg-[#f4efe2]'
          }`}
        >
          4. MESSAGE LEDGER
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-3 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-t-2 border-x-2 border-[#1a1a1a] transition-all cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-[#fbf8f1] text-[#1a1a1a] shadow-[0px_-2px_0px_#7a2020] -mb-[3px] border-b-3 border-b-[#fbf8f1] z-10'
              : 'bg-[#ede5d3] text-[#524d43] hover:bg-[#f4efe2]'
          }`}
        >
          5. DOCUMENTATION
        </button>
      </div>

      {/* Active Tab Panel Content */}
      <div className="pt-2 animate-in fade-in duration-150">
        {activeTab === 'device' && (
          <DeviceConnectTab userId={effectiveUserId} />
        )}

        {activeTab === 'keys' && (
          <ApiKeyManagerTab
            userId={effectiveUserId}
            onKeySelect={handleKeySelected}
          />
        )}

        {activeTab === 'tester' && (
          <MessageTesterTab
            userId={effectiveUserId}
            initialKey={activeKeyForTester}
          />
        )}

        {activeTab === 'logs' && <MessageLogsTab />}

        {activeTab === 'docs' && <DeveloperDocsTab />}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
