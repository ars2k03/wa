'use client';

import React, { useState } from 'react';
import type { OtpTemplateContent } from '@/types/types';
import { WhatsAppPreview } from './WhatsAppPreview';

// An example custom template for the docs, with a switch to show both ways it can be sent.

export const EXAMPLE_CUSTOM_TEMPLATE: OtpTemplateContent = {
  body: 'Your *ShopBD* login code is *{{code}}*\n\nNever share this code with anyone, including ShopBD staff. 🔒',
  footer: 'Valid for 10 minutes',
  showCopyButton: true,
  copyButtonText: 'Copy code',
};

export function CustomTemplateExample({ otp }: { otp: string }) {
  const [showCopyButton, setShowCopyButton] = useState(true);

  return (
    <div className="space-y-3">
      <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[3px_3px_0px_#1a1a1a]">
        <div className="border-b-2 border-[#1a1a1a] bg-[#ede5d3] px-3 py-1.5 font-mono text-[11px] font-extrabold tracking-[0.08em]">
          EXAMPLE TEMPLATE
        </div>
        <dl className="px-3 py-2.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 font-mono text-[12px]">
          <dt className="font-bold text-[#524d43]">Message</dt>
          <dd className="whitespace-pre-wrap break-words text-[#1a1a1a]">{EXAMPLE_CUSTOM_TEMPLATE.body}</dd>
          <dt className="font-bold text-[#524d43]">Footer</dt>
          <dd className="text-[#1a1a1a]">{EXAMPLE_CUSTOM_TEMPLATE.footer}</dd>
          <dt className="font-bold text-[#524d43]">Button</dt>
          <dd className="text-[#1a1a1a]">
            {showCopyButton ? `On, "${EXAMPLE_CUSTOM_TEMPLATE.copyButtonText}"` : 'Off'}
          </dd>
        </dl>
      </div>

      <div
        role="tablist"
        aria-label="Copy button"
        className="grid grid-cols-2 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] font-mono text-[11px] font-bold tracking-wider"
      >
        {(
          [
            [true, 'WITH COPY BUTTON'],
            [false, 'WITHOUT BUTTON'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={showCopyButton === value}
            onClick={() => setShowCopyButton(value)}
            className={`py-2 cursor-pointer transition-colors ${value ? '' : 'border-l-2 border-[#1a1a1a]'} ${
              showCopyButton === value ? 'bg-[#1a1a1a] text-[#fbf8f1]' : 'bg-[#f4efe2] text-[#1a1a1a] hover:bg-[#ede5d3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <WhatsAppPreview
        otp={otp}
        template={{ ...EXAMPLE_CUSTOM_TEMPLATE, showCopyButton }}
        senderNumber="ShopBD"
        markers={false}
      />
    </div>
  );
}
