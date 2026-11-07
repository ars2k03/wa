'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDashboardTab } from '@/context/DashboardTabContext';
import { Badge } from '@/components/ui/Badge';
import { DeviceConnectTab } from '@/components/dashboard/DeviceConnectTab';
import { ApiKeyManagerTab } from '@/components/dashboard/ApiKeyManagerTab';
import { MessageTesterTab } from '@/components/dashboard/MessageTesterTab';
import { MessageLogsTab } from '@/components/dashboard/MessageLogsTab';
import { OtpTemplateTab } from '@/components/dashboard/OtpTemplateTab';
import { UsageTab } from '@/components/dashboard/UsageTab';

function DashboardContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeTab } = useDashboardTab();
  const [activeKeyForTester, setActiveKeyForTester] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
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

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'device':
        return {
          title: 'WhatsApp Device Connection',
          desc: 'Connect and monitor your WhatsApp device for automated OTP and message delivery',
        };
      case 'keys':
        return {
          title: 'API Keys',
          desc: 'Create and manage secret API keys to authenticate your WhatsApp API requests',
        };
      case 'otp-template':
        return {
          title: 'Custom Template',
          desc: 'Customize the OTP message, footer and Copy Code button your users receive',
        };
      case 'tester':
        return {
          title: 'Playground',
          desc: 'Send test messages and verify your WhatsApp connection in real time',
        };
      case 'usage':
        return {
          title: 'Usage',
          desc: 'Track your daily and monthly OTP limits and recent sending activity',
        };
      case 'logs':
        return {
          title: 'Message Logs',
          desc: 'View real-time delivery status and history of sent WhatsApp messages',
        };
      default:
        return {
          title: 'Dispatch Console',
          desc: 'Manage WhatsApp API integrations',
        };
    }
  };

  const section = getSectionTitle();

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Clean Workstation Header */}
      <div className="border-b-2 border-[#1a1a1a] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#1a1a1a] tracking-tight">
            {section.title}
          </h1>
          <p className="font-serif text-xs sm:text-sm text-[#524d43] mt-0.5">
            {section.desc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" rotate="right">
            OPERATIONAL
          </Badge>
        </div>
      </div>

      {/* Active Workstation Body */}
      <div className="animate-in fade-in duration-150">
        {activeTab === 'device' && (
          <DeviceConnectTab userId={effectiveUserId} />
        )}

        {activeTab === 'keys' && (
          <ApiKeyManagerTab
            userId={effectiveUserId}
            onKeySelect={handleKeySelected}
          />
        )}

        {activeTab === 'otp-template' && <OtpTemplateTab />}

        {activeTab === 'tester' && (
          <MessageTesterTab
            userId={effectiveUserId}
            initialKey={activeKeyForTester}
          />
        )}

        {activeTab === 'logs' && <MessageLogsTab />}

        {activeTab === 'usage' && <UsageTab />}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
