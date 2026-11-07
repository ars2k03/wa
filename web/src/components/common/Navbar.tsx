'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Drawer, MenuButton } from '../ui/Drawer';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [gatewayOnline, setGatewayOnline] = useState<boolean | null>(null);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check backend health
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

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };

  const handleSectionScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setIsMenuOpen(false);
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        // Defer until the drawer has closed and page scrolling is unlocked.
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
        window.history.pushState(null, '', `#${targetId}`);
      }
    }
  };

  const handleConfirmSignout = () => {
    logout();
    setIsSignoutModalOpen(false);
    router.replace('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fbf8f1] border-b-2 border-[#1a1a1a] px-4">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4 relative">
        {/* Brand & Status (Left) */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group shrink-0 cursor-pointer"
        >
          <span className="font-serif font-black text-xl sm:text-2xl text-[#1a1a1a] tracking-tight group-hover:text-[#7a2020] transition-colors">
            WA Gateway
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-[#1a1a1a] select-none ${
              gatewayOnline === true
                ? 'bg-[#eaf3eb] text-[#2e6930]'
                : gatewayOnline === false
                ? 'bg-[#fae8e8] text-[#7a2020]'
                : 'bg-[#fef3c7] text-[#b45309]'
            }`}
            title={
              gatewayOnline === true
                ? 'Gateway service online'
                : gatewayOnline === false
                ? 'Gateway offline'
                : 'Checking status...'
            }
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
            <span className="hidden sm:inline">
              {gatewayOnline === true ? 'OPERATIONAL' : gatewayOnline === false ? 'OFFLINE' : 'CHECKING'}
            </span>
          </span>
        </Link>

        {/* Navigation Links (Centered in Middle) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider text-[#524d43] absolute left-1/2 -translate-x-1/2">
          <Link
            href="/#how-it-works"
            onClick={(e) => handleSectionScroll(e, 'how-it-works')}
            className="hover:text-[#1a1a1a] hover:underline transition-colors cursor-pointer"
          >
            How It Works
          </Link>
          <Link
            href="/docs"
            className={`hover:text-[#1a1a1a] hover:underline transition-colors cursor-pointer ${
              pathname.startsWith('/docs') ? 'text-[#7a2020] underline font-bold' : ''
            }`}
          >
            Docs
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="emerald" size="sm" className="text-xs py-1.5 px-3">
                  Dashboard
                </Button>
              </Link>
              <span className="hidden md:block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSignoutModalOpen(true)}
                  className="text-xs py-1.5 px-3 hover:bg-[#fae8e8] hover:text-[#7a2020] transition-colors"
                >
                  Sign Out
                </Button>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm" className="text-xs py-1.5 px-3 sm:px-4">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="text-xs py-1.5 px-3 sm:px-4">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <MenuButton
            onClick={() => setIsMenuOpen(true)}
            isOpen={isMenuOpen}
            controls="site-menu"
            className="md:hidden"
          />
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        id="site-menu"
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        side="right"
        label="Site menu"
        closeAtWidth={768}
        header={
          <span className="font-serif font-black text-xl text-[#1a1a1a] tracking-tight">WA Gateway</span>
        }
        footer={
          isAuthenticated ? (
            <div className="space-y-3">
              {user && (
                <div className="flex items-center gap-2 font-mono text-xs text-[#524d43] min-w-0">
                  <span className="w-2 h-2 shrink-0 rounded-full bg-[#2e6930]" />
                  <span className="truncate">Signed in as <b className="text-[#1a1a1a]">{user.name || user.email}</b></span>
                </div>
              )}
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block">
                <Button variant="emerald" size="sm" className="w-full text-xs py-2.5">
                  Open Dashboard →
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSignoutModalOpen(true);
                }}
                className="w-full text-xs py-2.5 hover:bg-[#fae8e8] hover:text-[#7a2020]"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block">
                <Button variant="outline" size="sm" className="w-full text-xs py-2.5">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block">
                <Button variant="primary" size="sm" className="w-full text-xs py-2.5">
                  Sign Up
                </Button>
              </Link>
            </div>
          )
        }
      >
        <nav className="p-4">
          <div className="font-mono text-[10px] font-black uppercase tracking-widest text-[#7a2020] pb-2 mb-1 border-b-2 border-[#1a1a1a]">
            Menu
          </div>
          {[
            { href: '/', label: 'Home', hint: 'Overview & features', active: pathname === '/' },
            { href: '/#how-it-works', label: 'How It Works', hint: '4 steps to your first OTP', section: 'how-it-works' },
            { href: '/docs', label: 'Docs', hint: 'API reference & guides', active: pathname.startsWith('/docs') },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.section) return handleSectionScroll(e, item.section);
                if (item.href === '/' && pathname === '/') {
                  handleLogoClick(e);
                }
                setIsMenuOpen(false);
              }}
              aria-current={item.active ? 'page' : undefined}
              className={`group flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 border-b border-[#1a1a1a]/15 transition-colors hover:bg-[#f4efe2] ${
                item.active ? 'text-[#7a2020]' : 'text-[#1a1a1a]'
              }`}
            >
              <span className="min-w-0">
                <span className="block font-serif font-bold text-lg leading-tight">{item.label}</span>
                <span className="block font-mono text-[11px] text-[#524d43] mt-0.5">{item.hint}</span>
              </span>
              <span className="font-mono text-sm text-[#524d43] group-hover:text-[#7a2020] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>
          ))}

          <div className="mt-6 flex items-center justify-between font-mono text-[11px] text-[#524d43]">
            <span>GATEWAY STATUS</span>
            <span
              className={`font-bold ${
                gatewayOnline === true ? 'text-[#2e6930]' : gatewayOnline === false ? 'text-[#7a2020]' : 'text-[#b45309]'
              }`}
            >
              {gatewayOnline === true ? '● OPERATIONAL' : gatewayOnline === false ? '● OFFLINE' : '● CHECKING'}
            </span>
          </div>
        </nav>
      </Drawer>

      {/* Sign Out Confirmation Alert Dialog Modal */}
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
