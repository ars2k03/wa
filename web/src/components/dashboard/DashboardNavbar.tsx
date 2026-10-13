'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export function DashboardNavbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [gatewayOnline, setGatewayOnline] = useState<boolean | null>(null);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);

  useEffect(() => {
    api
      .getStatus()
      .then(() => setGatewayOnline(true))
      .catch(() => setGatewayOnline(false));

    const interval = setInterval(() => {
      api
        .getStatus()
        .then(() => setGatewayOnline(true))
        .catch(() => setGatewayOnline(false));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleConfirmSignout = () => {
    logout();
    setIsSignoutModalOpen(false);
    router.replace('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fbf8f1] border-b-2 border-[#1a1a1a] h-16 shrink-0">
      <div className="w-full px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Brand & Console Badge (Left) */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            title="Go to Home"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="font-serif font-black text-xl sm:text-2xl text-[#1a1a1a] tracking-tight group-hover:text-[#7a2020] transition-colors">
              WA Gateway
            </span>
          </Link>

          <span className="hidden sm:inline-block text-[#524d43] font-mono text-xs">/</span>

          <Badge variant="ink" className="hidden sm:inline-flex text-[10px]">
            CONSOLE
          </Badge>

          {/* Gateway Status Indicator */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-[#1a1a1a] select-none ${
              gatewayOnline === true
                ? 'bg-[#eaf3eb] text-[#2e6930]'
                : gatewayOnline === false
                ? 'bg-[#fae8e8] text-[#7a2020]'
                : 'bg-[#fef3c7] text-[#b45309]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                gatewayOnline === true
                  ? 'bg-[#2e6930] animate-pulse'
                  : gatewayOnline === false
                  ? 'bg-[#7a2020]'
                  : 'bg-[#b45309]'
              }`}
            />
            <span className="hidden md:inline">
              {gatewayOnline === true ? 'OPERATIONAL' : gatewayOnline === false ? 'OFFLINE' : 'CHECKING'}
            </span>
          </span>
        </div>

        {/* Right: Operator Identity & Sign Out */}
        <div className="flex items-center gap-3">
          {user && (
            <Link
              href="/"
              title="Go to Home"
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#ede5d3] hover:bg-[#dfd4bd] border border-[#1a1a1a] text-xs font-mono transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#2e6930]" />
              <span className="font-bold text-[#1a1a1a] truncate max-w-[150px] lg:max-w-[200px]">
                {user.name || user.email}
              </span>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSignoutModalOpen(true)}
            className="text-xs py-1.5 px-3 hover:bg-[#fae8e8] hover:text-[#7a2020] transition-colors"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={isSignoutModalOpen}
        onClose={() => setIsSignoutModalOpen(false)}
        title="Sign Out"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSignoutModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmSignout}
              className="text-xs bg-[#7a2020] text-[#fbf8f1]"
            >
              Sign Out
            </Button>
          </div>
        }
      >
        <p className="font-serif text-sm text-[#524d43] leading-relaxed">
          Are you sure you want to sign out of your account?
        </p>
      </Modal>
    </header>
  );
}
