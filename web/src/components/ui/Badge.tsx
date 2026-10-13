'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'burgundy' | 'amber' | 'ink' | 'neutral';
  rotate?: 'left' | 'right' | 'none';
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  rotate = 'none',
  className = '',
}: BadgeProps) {
  const rotateClass = {
    left: '-rotate-2 transform',
    right: 'rotate-2 transform',
    none: '',
  }[rotate];

  const variantStyles = {
    emerald: 'border-[#2e6930] text-[#2e6930] bg-[#eaf3eb]',
    burgundy: 'border-[#7a2020] text-[#7a2020] bg-[#fae8e8]',
    amber: 'border-[#b45309] text-[#b45309] bg-[#fef3c7]',
    ink: 'border-[#1a1a1a] text-[#fbf8f1] bg-[#1a1a1a]',
    neutral: 'border-[#1a1a1a] text-[#1a1a1a] bg-[#f4efe2]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-bold tracking-widest uppercase border-2 select-none shadow-[1px_1px_0px_#1a1a1a] ${variantStyles} ${rotateClass} ${className}`}
    >
      {children}
    </span>
  );
}
