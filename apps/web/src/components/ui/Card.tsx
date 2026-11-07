'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: 'cream' | 'tint';
  shadow?: boolean;
  className?: string;
}

export function Card({
  children,
  title,
  subtitle,
  badge,
  headerAction,
  variant = 'cream',
  shadow = true,
  className = '',
}: CardProps) {
  const bgClass = variant === 'tint' ? 'bg-[#f4efe2]' : 'bg-[#fbf8f1]';
  const shadowClass = shadow ? 'shadow-[4px_4px_0px_#1a1a1a]' : '';

  return (
    <div
      className={`border-2 border-[#1a1a1a] ${bgClass} ${shadowClass} relative ${className}`}
    >
      {(title || badge || headerAction) && (
        <div className="border-b-2 border-[#1a1a1a] px-4 py-3 bg-[#ede6d5] flex items-center justify-between flex-wrap gap-2">
          <div>
            {title && (
              <h3 className="font-serif font-black text-lg text-[#1a1a1a] tracking-tight flex items-center gap-2">
                {title}
                {badge}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#524d43] font-mono uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
