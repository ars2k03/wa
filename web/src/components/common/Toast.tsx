'use client';

import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgStyles = {
          success: 'bg-[#eaf3eb] border-[#2e6930] text-[#2e6930]',
          error: 'bg-[#fae8e8] border-[#7a2020] text-[#7a2020]',
          info: 'bg-[#f4efe2] border-[#1a1a1a] text-[#1a1a1a]',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border-2 ${bgStyles} p-3.5 shadow-[4px_4px_0px_#1a1a1a] flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-150`}
          >
            <div className="flex items-start gap-2">
              <span className="font-mono font-bold text-sm">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </span>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider">
                  TELEGRAPH DISPATCH: {toast.type.toUpperCase()}
                </p>
                <p className="font-serif text-sm text-[#1a1a1a] mt-0.5">
                  {toast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-xs font-mono font-bold opacity-60 hover:opacity-100 cursor-pointer"
            >
              [CLOSE]
            </button>
          </div>
        );
      })}
    </div>
  );
}
