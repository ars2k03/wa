'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DeviceConnectTab } from '@/components/dashboard/DeviceConnectTab';
import { ApiKeyManagerTab } from '@/components/dashboard/ApiKeyManagerTab';
import { MessageTesterTab } from '@/components/dashboard/MessageTesterTab';
import { MessageLogsTab } from '@/components/dashboard/MessageLogsTab';
import { DeveloperDocsTab } from '@/components/dashboard/DeveloperDocsTab';

type TabType = 'device' | 'keys' | 'tester' | 'logs' | 'docs';

function DashboardContent() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('device');
  const [activeKeyForTester, setActiveKeyForTester] = useState<string>('');

  // Fallback to guest operator ID if browsing without logging in
  const effectiveUserId = user?.id || 'operator_guest';

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
            <Badge variant={isAuthenticated ? 'emerald' : 'amber'} rotate="right">
              {isAuthenticated ? 'AUTHENTICATED' : 'GUEST OPERATOR'}
            </Badge>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#1a1a1a] uppercase tracking-tight">
            {isAuthenticated
              ? `DISPATCH STATION: ${user?.name || user?.email}`
              : 'CENTRAL DISPATCH STATION'}
          </h2>
          <p className="font-serif text-xs sm:text-sm text-[#524d43]">
            Targeting High-Velocity Gateway running on <span className="font-mono font-bold text-[#1a1a1a]">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}</span>
          </p>
        </div>

        {!isAuthenticated && (
          <div className="flex items-center gap-2 bg-[#fbf8f1] border-2 border-[#1a1a1a] p-3 shadow-[2px_2px_0px_#1a1a1a]">
            <span className="font-serif text-xs text-[#524d43]">
              Operating as guest session. Sign in to preserve permanent access keys:
            </span>
            <Link href="/login">
              <Button variant="primary" size="sm" className="text-xs py-1 px-3">
                SIGN IN
              </Button>
            </Link>
          </div>
        )}
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
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1a1a]">
        <Navbar />
        <main className="flex-1">
          <DashboardContent />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
