'use client';

import React, { useEffect, useState } from 'react';

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
      { id: 'quickstart', label: 'Quickstart' },
    ],
  },
  {
    title: 'Basics',
    links: [
      { id: 'authentication', label: 'Authentication' },
      { id: 'phone-format', label: 'Phone number format' },
    ],
  },
  {
    title: 'API reference',
    links: [{ id: 'send-otp', label: '/send-otp', method: 'POST' }],
  },
  {
    title: 'Reference',
    links: [
      { id: 'errors', label: 'Errors' },
      { id: 'message-preview', label: 'What users receive' },
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

  return (
    <aside className="bg-[#fbf8f1] border-b-2 border-[#1a1a1a] lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-40 lg:w-[var(--docs-sidebar-w)] lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="lg:hidden w-full text-left font-mono text-xs font-extrabold px-4 py-3 bg-[#f4efe2] cursor-pointer"
      >
        {open ? '✕ Close menu' : '☰ Documentation menu'}
      </button>

      <nav className={`${open ? 'block' : 'hidden'} lg:block px-4 py-7`}>
        {groups.map((group) => (
          <div key={group.title} className="mb-5 last:mb-0">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7a2020] mb-2">
              {group.title}
            </div>
            {group.links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                className={`flex items-center font-mono text-[13px] px-2.5 py-1.5 border-l-2 ${
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
    </aside>
  );
}
