'use client';

import React, { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '@/utils/utils';
import { renderOtpBody } from '@/utils/otpTemplate';
import type { OtpTemplateContent } from '@/types/types';

// A realistic WhatsApp (Android, light theme) chat showing the OTP message exactly as the
// backend sends it (backend/src/whatsapp/template/template.ts): the default message, or a
// user's custom OTP template. Numbered markers line up with the legend on the docs page.

const WA = {
  header: '#008069',
  wallpaper: '#efeae2',
  bubble: '#ffffff',
  text: '#111b21',
  meta: '#667781',
  link: '#027eb5',
  chip: '#ffffff',
  notice: '#ffeecd',
};

export function Marker({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-[#7a2020] text-[#fbf8f1] font-mono text-[11px] font-extrabold border-2 border-[#fbf8f1] shadow-[0_0_0_2px_#7a2020] ${className}`}
    >
      {n}
    </span>
  );
}

function Icon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  video: 'M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z',
  call: 'M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z',
  more: 'M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  lock: 'M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z',
  copy: 'M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z',
  emoji: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 17.5A5.5 5.5 0 0 1 6.9 14h10.2a5.5 5.5 0 0 1-5.1 3.5z',
  attach: 'M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6h-1.5z',
  camera: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.17L15 2H9z',
  mic: 'M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5.3-3a5.3 5.3 0 0 1-10.6 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-1.7z',
};

// Faint doodle-like wallpaper, drawn with CSS so it needs no image.
const WALLPAPER = {
  backgroundColor: WA.wallpaper,
  backgroundImage:
    'radial-gradient(circle at 20% 30%, rgba(0,0,0,0.035) 2px, transparent 2.5px),' +
    'radial-gradient(circle at 70% 60%, rgba(0,0,0,0.03) 3px, transparent 3.5px),' +
    'radial-gradient(circle at 45% 85%, rgba(0,0,0,0.03) 1.5px, transparent 2px)',
  backgroundSize: '46px 46px, 64px 64px, 38px 38px',
};

const STATUS_BAR = 28;
const CHAT_HEADER = 56;
const INPUT_BAR = 60;

// Fixed clock so server and client render the same thing
const PHONE_TIME = '10:18';

/** Phone frame with status bar, chat header, wallpaper and input bar. Messages go in children. */
export function WhatsAppPhone({
  children,
  overlay,
  senderNumber = '+880 1711-000000',
  height = 640,
  markers = false,
}: {
  children: React.ReactNode;
  /** Rendered above the chat without scrolling with it (e.g. a toast) */
  overlay?: React.ReactNode;
  senderNumber?: string;
  height?: number;
  /** Show the numbered docs markers */
  markers?: boolean;
}) {
  return (
    <div className="flex justify-center">
      {/* Phone frame */}
      <div className="relative w-full max-w-[360px] rounded-[2.4rem] border-[10px] border-[#1a1a1a] bg-[#1a1a1a] shadow-[8px_8px_0px_#7a2020]">
        <div className="relative overflow-hidden rounded-[1.7rem] bg-white font-sans" style={{ height }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 text-[11px] font-semibold text-white" style={{ background: WA.header, height: STATUS_BAR }}>
            <span>{PHONE_TIME}</span>
            <span className="w-16 h-4 rounded-full bg-[#1a1a1a]" aria-hidden />
            <span>5G ▮▮▮ 86%</span>
          </div>

          {/* Chat header */}
          <div className="relative flex items-center gap-2 px-2 text-white" style={{ background: WA.header, height: CHAT_HEADER }}>
            <Icon d={ICONS.back} className="w-6 h-6" />
            <div className="relative shrink-0 w-9 h-9 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#8696a0]">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden>
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5z" />
              </svg>
              {markers && <Marker n={1} className="absolute -bottom-2 -right-2 scale-90" />}
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="text-[16px] font-medium truncate">{senderNumber}</div>
              <div className="text-[12.5px] text-white/80">online</div>
            </div>
            <Icon d={ICONS.video} className="w-6 h-6 mx-1" />
            <Icon d={ICONS.call} className="w-5 h-5 mx-1" />
            <Icon d={ICONS.more} className="w-5 h-5" />
          </div>

          {/* Conversation */}
          <div className="relative" style={{ ...WALLPAPER, height: height - STATUS_BAR - CHAT_HEADER - INPUT_BAR }}>
            <div className="h-full overflow-y-auto flex flex-col px-3 pt-3 pb-4">
              <div className="self-center rounded-md px-3 py-1 text-[12.5px] text-[#54656f] shadow-sm" style={{ background: WA.chip }}>
                Today
              </div>
              <div
                className="self-center mt-3 max-w-[90%] rounded-md px-3 py-1.5 text-center text-[12px] leading-snug text-[#54656f] shadow-sm"
                style={{ background: WA.notice }}
              >
                <Icon d={ICONS.lock} className="inline w-3 h-3 -mt-0.5 mr-1" />
                Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
              </div>
              {children}
            </div>
            {overlay}
          </div>

          {/* Input bar (decorative) */}
          <div className="flex items-center gap-2 px-2" style={{ background: WA.wallpaper, height: INPUT_BAR }} aria-hidden>
            <div className="flex-1 flex items-center gap-2 rounded-full bg-white px-3 h-11 text-[#8696a0] shadow-sm">
              <Icon d={ICONS.emoji} className="w-6 h-6" />
              <span className="flex-1 text-[15px]">Message</span>
              <Icon d={ICONS.attach} className="w-5 h-5 -rotate-45" />
              <Icon d={ICONS.camera} className="w-5 h-5" />
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: WA.header }}>
              <Icon d={ICONS.mic} className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Incoming message bubble with the WhatsApp tail */
function IncomingBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-5 self-start max-w-[82%]">
      <span
        aria-hidden
        className="absolute -left-2 top-0 w-0 h-0 border-t-[10px] border-l-[10px] border-t-white border-l-transparent"
      />
      <div className="rounded-lg rounded-tl-none shadow-sm" style={{ background: WA.bubble }}>
        {children}
      </div>
    </div>
  );
}

// WhatsApp text formatting: ```mono```, *bold*, _italic_, ~strike~. Like WhatsApp, markers
// only count at word edges, so "snake_case" or "2*3*4" stay plain.
const FORMAT_PATTERN =
  /```([\s\S]+?)```|(?<![\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])|(?<![\w_])_(?!\s)([^_\n]+?)(?<!\s)_(?![\w_])|(?<![\w~])~(?!\s)([^~\n]+?)(?<!\s)~(?![\w~])/g;

/** Renders text the way WhatsApp does */
function WhatsAppText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(FORMAT_PATTERN)) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const [, mono, bold, italic, strike] = match;
    if (mono !== undefined) nodes.push(<code key={key++} className="font-mono text-[0.92em]">{mono}</code>);
    else if (bold !== undefined) nodes.push(<strong key={key++}>{bold}</strong>);
    else if (italic !== undefined) nodes.push(<em key={key++}>{italic}</em>);
    else nodes.push(<s key={key++}>{strike}</s>);
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

export function WhatsAppPreview({
  otp,
  template,
  senderNumber = '+880 1711-000000',
  time = `${PHONE_TIME} am`,
  markers = true,
  height,
}: {
  otp: string;
  /** A custom OTP template; without it the default message is shown */
  template?: OtpTemplateContent;
  senderNumber?: string;
  time?: string;
  markers?: boolean;
  height?: number;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(otp);
    setToast(ok ? 'Code copied' : "Couldn't copy. Your browser blocked it.");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2000);
  };

  const footer = template ? template.footer?.trim() || null : 'This code expires in 5 minutes';
  const showCopyButton = template ? template.showCopyButton : true;
  const copyButtonText = template?.copyButtonText.trim() || 'Copy Code';

  return (
    <WhatsAppPhone
      senderNumber={senderNumber}
      height={height}
      markers={markers}
      overlay={
        /* "Copied" toast, like Android's */
        <div
          role="status"
          aria-live="polite"
          className={`absolute left-1/2 -translate-x-1/2 bottom-4 whitespace-nowrap rounded-full bg-[#323232] px-4 py-2 text-[13px] text-white shadow-lg transition-all duration-200 ${
            toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {toast}
        </div>
      }
    >
      {/* Incoming OTP message */}
      <IncomingBubble>
        <div
          className="relative px-3 pt-2 pb-1 text-[15px] leading-[1.45] whitespace-pre-wrap break-words"
          style={{ color: WA.text }}
        >
          {markers && <Marker n={2} className="absolute -right-9 top-2" />}
          {template ? (
            <WhatsAppText text={renderOtpBody(template.body, otp)} />
          ) : (
            <>
              <strong className="text-[17px] tracking-wide">{otp}</strong> is your verification code.
              {'\n\n'}For your security, do not share this code.
            </>
          )}
          {/* Without the button, the backend sends plain text with the footer as an italic last line */}
          {!showCopyButton && footer && (
            <>
              {'\n\n'}
              <em>{footer}</em>
            </>
          )}
        </div>
        <div className="relative flex items-end justify-between gap-3 px-3 pb-2">
          <span className="text-[13px]" style={{ color: WA.meta }}>
            {showCopyButton ? footer : null}
          </span>
          <span className="shrink-0 text-[11px]" style={{ color: WA.meta }}>
            {time}
          </span>
          {markers && <Marker n={3} className="absolute -right-9 top-0" />}
        </div>
        {showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            className="relative w-full flex items-center justify-center gap-2 rounded-b-lg border-t border-[#e9edef] py-3 text-[15px] font-medium cursor-pointer hover:bg-[#f5f6f6] active:bg-[#e9edef] transition-colors"
            style={{ color: WA.link }}
          >
            <Icon d={ICONS.copy} className="w-[18px] h-[18px]" />
            {copyButtonText}
            {markers && <Marker n={4} className="absolute -right-9 top-1/2 -translate-y-1/2" />}
          </button>
        )}
      </IncomingBubble>
    </WhatsAppPhone>
  );
}
