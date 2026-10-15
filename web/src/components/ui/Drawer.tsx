'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
  side?: 'left' | 'right';
  /** Accessible name for the panel. */
  label: string;
  /** Rendered in the top bar, next to the close button. */
  header?: React.ReactNode;
  children: React.ReactNode;
  /** Pinned to the bottom of the panel (e.g. auth buttons). */
  footer?: React.ReactNode;
  /** Close automatically once the viewport reaches this width (px), where the desktop nav takes over. */
  closeAtWidth?: number;
}

const subscribeNoop = () => () => {};

export function Drawer({
  isOpen,
  onClose,
  id,
  side = 'right',
  label,
  header,
  children,
  footer,
  closeAtWidth,
}: DrawerProps) {
  // Portals need `document`; this is false during SSR and true after hydration.
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keep the latest onClose without re-running the open/close effects when callers pass inline functions.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape to close, lock page scroll, and move focus into the panel while open.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  // Rotating a tablet or resizing a window past the breakpoint shouldn't leave a stale drawer open.
  useEffect(() => {
    if (!isOpen || !closeAtWidth) return;
    const mq = window.matchMedia(`(min-width: ${closeAtWidth}px)`);
    const handleChange = () => {
      if (mq.matches) onCloseRef.current();
    };
    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [isOpen, closeAtWidth]);

  if (!isClient) return null;

  const isLeft = side === 'left';

  return createPortal(
    <div className={`fixed inset-0 z-[60] ${isOpen ? '' : 'pointer-events-none'}`} inert={!isOpen}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-[#1a1a1a]/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`absolute top-0 bottom-0 ${isLeft ? 'left-0 border-r-2' : 'right-0 border-l-2'} w-[86vw] max-w-[340px] bg-[#fbf8f1] border-[#1a1a1a] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen
            ? `translate-x-0 ${isLeft ? 'shadow-[6px_0_0_#1a1a1a]' : 'shadow-[-6px_0_0_#1a1a1a]'}`
            : isLeft
            ? '-translate-x-full'
            : 'translate-x-full'
        }`}
      >
        <div className="h-16 shrink-0 px-4 flex items-center justify-between gap-3 border-b-2 border-[#1a1a1a] bg-[#f4efe2]">
          <div className="min-w-0">{header}</div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 shrink-0 flex items-center justify-center border-2 border-[#1a1a1a] bg-[#fbf8f1] hover:bg-[#7a2020] hover:text-[#fbf8f1] shadow-[2px_2px_0px_#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {footer && (
          <div className="shrink-0 border-t-2 border-[#1a1a1a] bg-[#f4efe2] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** The ☰ button that opens a Drawer. */
export function MenuButton({
  onClick,
  isOpen,
  controls,
  className = '',
}: {
  onClick: () => void;
  isOpen: boolean;
  controls?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls={controls}
      aria-label="Open menu"
      className={`w-9 h-9 shrink-0 flex items-center justify-center border-2 border-[#1a1a1a] bg-[#fbf8f1] text-[#1a1a1a] hover:bg-[#ede5d3] shadow-[2px_2px_0px_#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
