'use client';

import React, { useState } from 'react';
import { copyToClipboard } from '@/utils/utils';

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[0.88em] font-semibold bg-[#f4efe2] border border-[#d6cdb8] px-1.5 py-px text-[#1a1a1a] whitespace-nowrap">
      {children}
    </code>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#7a2020]">
      {children}
    </div>
  );
}

export function DocsSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 pb-12 mb-12 border-b-2 border-dashed border-[#d6cdb8] last:border-b-0 last:mb-0"
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-serif text-[28px] font-black text-[#1a1a1a] mt-1.5 mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function Prose({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`font-serif text-[#524d43] leading-relaxed max-w-[70ch] mb-3.5 ${className}`}>{children}</p>;
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#1a1a1a] mt-7 mb-2.5">
      {children}
    </h3>
  );
}

type CalloutTone = 'note' | 'tip' | 'warn';
const calloutTones: Record<CalloutTone, string> = {
  note: 'border-l-[#1a1a1a] bg-[#f4efe2]',
  tip: 'border-l-[#2e6930] bg-[#eaf3eb]',
  warn: 'border-l-[#b45309] bg-[#f4efe2]',
};

export function Callout({
  tone = 'note',
  title,
  children,
}: {
  tone?: CalloutTone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border-2 border-[#1a1a1a] border-l-[6px] ${calloutTones[tone]} px-3.5 py-3 my-4 max-w-[70ch]`}>
      <div className="font-mono text-[11px] font-extrabold tracking-[0.08em] text-[#1a1a1a] mb-0.5">{title}</div>
      <div className="font-serif text-sm text-[#1a1a1a] leading-relaxed">{children}</div>
    </div>
  );
}

export interface Param {
  name: string;
  type: string;
  required?: boolean;
  children: React.ReactNode;
}

export function ParamList({ params }: { params: Param[] }) {
  return (
    <div className="border-t-2 border-[#1a1a1a]">
      {params.map((p) => (
        <div key={p.name} className="py-3 border-b border-[#d6cdb8]">
          <div className="font-mono text-[13px]">
            <span className="font-extrabold text-[#1a1a1a]">{p.name}</span>
            <span className="ml-1.5 font-semibold text-xs text-[#524d43]">{p.type}</span>
            {p.required && (
              <span className="ml-1.5 font-extrabold text-[10px] tracking-[0.06em] text-[#7a2020]">REQUIRED</span>
            )}
          </div>
          <div className="font-serif text-sm text-[#524d43] leading-relaxed mt-1">{p.children}</div>
        </div>
      ))}
    </div>
  );
}

export function DocsTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[4px_4px_0px_#1a1a1a] overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="text-left font-mono text-[10px] font-extrabold tracking-[0.1em] text-[#524d43] px-3 py-2.5 border-b-2 border-[#1a1a1a] bg-[#f4efe2]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`p-3 border-b border-[#d6cdb8] align-top ${
                    j === 0
                      ? 'font-mono text-[13px] font-extrabold text-[#7a2020]'
                      : 'font-serif text-[#524d43]'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Colours JSON keys, strings and literals for the dark code panels.
function highlightJson(json: string): React.ReactNode[] {
  const token = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = token.exec(json))) {
    if (m.index > last) out.push(json.slice(last, m.index));
    const [text, str, colon] = m;
    const cls = str ? (colon ? 'text-[#93c5fd]' : 'text-[#86efac]') : 'text-[#fef08a]';
    out.push(
      <span key={m.index} className={cls}>
        {str ?? text}
      </span>,
    );
    if (colon) out.push(colon);
    last = m.index + text.length;
  }
  out.push(json.slice(last));
  return out;
}

export interface CodeTab {
  id: string;
  label: string;
  code: string;
}

export function CodePanel({
  label,
  status,
  tabs,
  json = false,
}: {
  label?: string;
  status?: { text: string; ok: boolean };
  tabs: CodeTab[];
  json?: boolean;
}) {
  const [active, setActive] = useState(tabs[0].id);
  const [copied, setCopied] = useState(false);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  const handleCopy = () => {
    copyToClipboard(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] shadow-[5px_5px_0px_#7a2020] min-w-0">
      <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-b border-[#333333] bg-[#222222]">
        {tabs.length > 1 ? (
          <div className="flex flex-wrap gap-0.5" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={t.id === active}
                onClick={() => setActive(t.id)}
                className={`font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] px-2 py-1 cursor-pointer ${
                  t.id === active ? 'bg-[#fbf8f1] text-[#1a1a1a]' : 'text-[#a3a3a3] hover:text-[#fbf8f1]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-[#a3a3a3]">
            {label}
            {status && (
              <span className={`ml-1.5 ${status.ok ? 'text-[#86efac]' : 'text-[#fca5a5]'}`}>{status.text}</span>
            )}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="font-mono text-[10px] font-extrabold text-[#d4d4d4] border border-[#524d43] px-2 py-1 hover:border-[#fbf8f1] hover:text-[#fbf8f1] cursor-pointer shrink-0"
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>
      <pre className="m-0 p-4 overflow-x-auto font-mono text-[12.5px] leading-[1.65]">
        <code>{json ? highlightJson(current.code) : current.code}</code>
      </pre>
    </div>
  );
}

/** Two columns on wide screens: explanation on the left, code on the right. */
export function Split({ children, aside }: { children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      <div className="min-w-0">{children}</div>
      <div className="xl:sticky xl:top-24 grid gap-4 min-w-0">{aside}</div>
    </div>
  );
}
