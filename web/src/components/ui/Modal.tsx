'use client';

import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    // Only touch body scroll while open, so a closed modal re-rendering can't unlock a drawer's scroll lock.
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/70 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg bg-[#fbf8f1] border-3 border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Newspaper Style Header */}
        <div className="border-b-2 border-[#1a1a1a] px-5 py-3.5 bg-[#ede5d3] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-black text-xl text-[#1a1a1a] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#524d43] font-mono uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-[#1a1a1a] bg-[#fbf8f1] hover:bg-[#7a2020] hover:text-[#fbf8f1] font-mono font-bold text-sm shadow-[2px_2px_0px_#1a1a1a] transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t-2 border-[#1a1a1a] px-6 py-4 bg-[#f4efe2] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
