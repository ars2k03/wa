'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';

interface SidebarGroup {
  title: string;
  links: { id: string; label: string; method?: string }[];
}

// Each link id must match a section id on the docs page.
const GROUPS: SidebarGroup[] = [
  {
    title: 'Getting started',
    links: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'how-it-works', label: 'How it works' },
      { id: 'quickstart', label: 'Quickstart' },
    ],
  },
  {
    title: 'Basics',
    links: [
      { id: 'authentication', label: 'Authentication' },
      { id: 'phone-format', label: 'Phone number format' },
      { id: 'rate-limits', label: 'Rate limits' },
    ],
  },
  {
    title: 'API reference',
    links: [{ id: 'send-otp', label: '/send-otp', method: 'POST' }],
  },
  {
    title: 'Guides',
    links: [
      { id: 'verify-codes', label: 'Verify OTP codes' },
      { id: 'handle-errors', label: 'Handle errors' },
    ],
  },
  {
    title: 'Reference',
    links: [
      { id: 'errors', label: 'Error codes' },
      { id: 'message-preview', label: 'What users receive' },
      { id: 'custom-template', label: 'Custom template' },
      { id: 'message-logs', label: 'Message logs' },
      { id: 'best-practices', label: 'Best practices' },
      { id: 'faq', label: 'FAQ' },
    ],
  },
];

export function DocsSidebar({ groups = GROUPS }: { groups?: SidebarGroup[] }) {
  const [activeId, setActiveId] = useState(groups[0]?.links[0]?.id);
  const [open, setOpen] = useState(false);

  // Highlight the link for whichever section is in the middle of the viewport.
  useEffect(() => {
    const ids = groups.flatMap((g) => g.links.map((l) => l.id));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [groups]);

  const activeLabel = groups.flatMap((g) => g.links).find((l) => l.id === activeId)?.label;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!open) return;
    // In the drawer: close it first, then scroll once page scrolling is unlocked.
    e.preventDefault();
    setOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }, 0);
  };

  const links = (
    <nav className="px-4 py-7">
      {groups.map((group) => (
        <div key={group.title} className="mb-5 last:mb-0">
          <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7a2020] mb-2">
            {group.title}
          </div>
          {group.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleLinkClick(e, link.id)}
              aria-current={activeId === link.id ? 'location' : undefined}
              className={`flex items-center font-mono text-[13px] px-2.5 py-2 lg:py-1.5 border-l-2 ${
                activeId === link.id
                  ? 'border-[#7a2020] bg-[#f4efe2] text-[#1a1a1a] font-extrabold'
                  : 'border-transparent text-[#524d43] font-semibold hover:bg-[#f4efe2] hover:text-[#1a1a1a]'
              }`}
            >
              {link.method && (
                <span className="font-mono text-[9px] font-extrabold bg-[#2e6930] text-[#fbf8f1] px-1 mr-1.5">
                  {link.method}
                </span>
              )}
              {link.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Small screens: sticky bar showing where you are; tapping it opens the drawer. */}
      <div className="lg:hidden sticky top-16 z-40 bg-[#f4efe2] border-b-2 border-[#1a1a1a]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="docs-menu"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer"
        >
          <span className="w-7 h-7 shrink-0 flex items-center justify-center border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[2px_2px_0px_#1a1a1a]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7a2020]">
              On this page
            </span>
            <span className="block truncate font-mono text-xs font-extrabold text-[#1a1a1a]">
              {activeLabel ?? 'Documentation'}
            </span>
          </span>
          <span className="font-mono text-[10px] font-bold uppercase text-[#524d43]">Menu</span>
        </button>
      </div>

      <Drawer
        id="docs-menu"
        isOpen={open}
        onClose={() => setOpen(false)}
        side="left"
        label="Documentation menu"
        closeAtWidth={1024}
        header={
          <span className="flex items-center gap-2">
            <span className="font-serif font-black text-xl text-[#1a1a1a] tracking-tight">Docs</span>
            <span className="font-mono text-[10px] font-bold uppercase text-[#524d43]">contents</span>
          </span>
        }
      >
        {links}
      </Drawer>

      {/* Large screens: fixed sidebar. */}
      <aside className="hidden lg:block fixed top-16 bottom-0 left-0 z-40 w-[var(--docs-sidebar-w)] overflow-y-auto overscroll-contain bg-[#fbf8f1] border-r-2 border-[#1a1a1a]">
        {links}
      </aside>
    </>
  );
}
