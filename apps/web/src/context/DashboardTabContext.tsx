'use client';

import React, { createContext, useContext, useState } from 'react';

export type DashboardTab = 'device' | 'keys' | 'otp-template' | 'tester' | 'logs' | 'usage';

interface DashboardTabContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

const DashboardTabContext = createContext<DashboardTabContextType | undefined>(undefined);

export function DashboardTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('device');

  return (
    <DashboardTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DashboardTabContext.Provider>
  );
}

export function useDashboardTab() {
  const context = useContext(DashboardTabContext);
  if (!context) {
    throw new Error('useDashboardTab must be used within a DashboardTabProvider');
  }
  return context;
}
