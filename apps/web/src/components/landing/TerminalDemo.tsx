'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Seg = { text: string; color: string };
type Phase = 'typing' | 'running' | 'response' | 'done';

const SAMPLES = [
  { phone: '+8801712345678', otp: '482910' },
  { phone: '+8801898765432', otp: '730164' },
  { phone: '+8801556677889', otp: '159283' },
];

const TYPE_SPEED_MS = 18;
const RUNNING_MS = 1100;
const LINE_SPEED_MS = 70;
const HOLD_MS = 4000;

function buildCommand(apiUrl: string, phone: string, otp: string): Seg[] {
  return [
    { text: 'curl -X POST ', color: 'text-[#fbf8f1]' },
    { text: `"${apiUrl}/send-otp"`, color: 'text-[#fca5a5]' },
    { text: ' \\\n  ', color: 'text-[#fbf8f1]' },
    { text: '-H "x-api-key: _ars_2k03_a9f1b8c2d3e4f5061728394a5b6c7d8e9f0123456789abcd"', color: 'text-[#fef08a]' },
    { text: ' \\\n  ', color: 'text-[#fbf8f1]' },
    { text: '-H "Content-Type: application/json"', color: 'text-[#93c5fd]' },
    { text: ' \\\n  ', color: 'text-[#fbf8f1]' },
    { text: "-d '{", color: 'text-[#d8b4fe]' },
    { text: `"phoneNumber":"${phone}","otp":"${otp}"`, color: 'text-[#86efac]' },
    { text: "}'", color: 'text-[#d8b4fe]' },
  ];
}

// Mirrors the backend's POST /send-otp response (see apps/server/src/whatsapp/whatsapp.controller.ts).
function buildResponse(phone: string, messageId: string): string[] {
  return JSON.stringify(
    {
      statusCode: 200,
      success: true,
      message: 'OTP sent successfully',
      data: {
        messageId,
        recipientJid: `${phone.replace(/\D/g, '')}@s.whatsapp.net`,
      },
    },
    null,
    2,
  ).split('\n');
}

export function TerminalDemo({ apiUrl }: { apiUrl: string }) {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [typed, setTyped] = useState(0);
  const [shownLines, setShownLines] = useState(0);
  // Generated only from timers (never during render) so SSR output stays deterministic.
  const [response, setResponse] = useState(() =>
    buildResponse(SAMPLES[0].phone, '3EB0A1F4C29D7E83B6105F'),
  );
  const bodyRef = useRef<HTMLDivElement>(null);

  const sample = SAMPLES[run % SAMPLES.length];
  const command = useMemo(() => buildCommand(apiUrl, sample.phone, sample.otp), [apiUrl, sample]);
  const totalChars = useMemo(() => command.reduce((n, s) => n + s.text.length, 0), [command]);

  // Respect reduced-motion: render the finished state without animating.
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => {
      setTyped(totalChars);
      setShownLines(response.length);
      setPhase('done');
    }, 0);
    return () => clearTimeout(t);
  }, [totalChars, response.length]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (typed < totalChars) {
        const jitter = Math.random() * 30;
        t = setTimeout(() => setTyped((n) => n + 1), TYPE_SPEED_MS + jitter);
      } else {
        t = setTimeout(() => setPhase('running'), 400);
      }
    } else if (phase === 'running') {
      t = setTimeout(() => {
        // WhatsApp message IDs: "3EB0" + 18 uppercase hex chars.
        const hex = Array.from({ length: 18 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setResponse(buildResponse(sample.phone, `3EB0${hex.toUpperCase()}`));
        setPhase('response');
      }, RUNNING_MS);
    } else if (phase === 'response') {
      if (shownLines < response.length) {
        t = setTimeout(() => setShownLines((n) => n + 1), LINE_SPEED_MS);
      } else {
        t = setTimeout(() => setPhase('done'), LINE_SPEED_MS);
      }
    } else if (phase === 'done') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      t = setTimeout(() => {
        setTyped(0);
        setShownLines(0);
        setRun((r) => r + 1);
        setPhase('typing');
      }, HOLD_MS);
    }
    return () => clearTimeout(t);
  }, [phase, typed, totalChars, shownLines, response.length, sample]);

  // Keep the newest output in view.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed, shownLines, phase]);

  // Slice the colored command segments up to the number of typed characters.
  const starts = command.map((_, i) => command.slice(0, i).reduce((n, s) => n + s.text.length, 0));
  const visibleCommand = command.map((seg, i) => {
    const part = seg.text.slice(0, Math.max(0, typed - starts[i]));
    if (!part) return null;
    return (
      <span key={i} className={seg.color}>
        {part}
      </span>
    );
  });

  // Kali Linux two-line zsh prompt.
  const prompt = (
    <>
      <span className="text-[#22c55e]">┌──(</span>
      <span className="text-[#3b82f6] font-bold">ars2k03㉿wagateway</span>
      <span className="text-[#22c55e]">)-[</span>
      <span className="text-[#fbf8f1] font-bold">~</span>
      <span className="text-[#22c55e]">]{'\n'}└─</span>
      <span className="text-[#3b82f6] font-bold">$</span>{' '}
    </>
  );

  const cursor = <span className="inline-block w-[7px] h-[14px] -mb-[2px] bg-[#fbf8f1] animate-pulse" />;

  return (
    <div className="border-2 border-[#1a1a1a] shadow-[6px_6px_0px_#1a1a1a] bg-[#1a1a1a]">
      {/* Terminal Header */}
      <div className="border-b-2 border-[#333333] text-[#fbf8f1] px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          <span className="font-mono text-xs font-bold tracking-wider ml-1 text-[#d4d4d4] whitespace-nowrap">
            cURL <span className="hidden sm:inline">Request </span>Preview
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#22c55e] whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          POST /send-otp
        </span>
      </div>

      {/* Terminal Body */}
      <div
        ref={bodyRef}
        aria-label="Animated example of sending an OTP with curl"
        className="h-[340px] sm:h-[460px] overflow-y-auto overflow-x-hidden p-4 font-mono text-xs leading-relaxed text-[#fbf8f1] [scrollbar-width:none]"
      >
        <div className="whitespace-pre-wrap break-all">
          {prompt}
          {visibleCommand}
          {phase === 'typing' && cursor}
        </div>

        {phase === 'running' && (
          <div className="mt-5 text-[#a3a3a3]">
            <span className="inline-block animate-spin mr-2">◐</span>
            Sending request...
          </div>
        )}

        {(phase === 'response' || phase === 'done') && (
          <pre className="mt-5 text-[#86efac] whitespace-pre-wrap break-all">
            {response.slice(0, shownLines).join('\n')}
          </pre>
        )}

        {phase === 'done' && (
          <div className="mt-5 whitespace-pre-wrap">
            {prompt}
            {cursor}
          </div>
        )}
      </div>
    </div>
  );
}
