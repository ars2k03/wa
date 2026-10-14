'use client';

import React, { useState, useSyncExternalStore } from 'react';
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

// ---------------------------------------------------------------------------
// Syntax highlighting (small, dependency-free; tuned for the snippets in the docs)
// ---------------------------------------------------------------------------

const C = {
  comment: 'text-[#8a8478] italic',
  string: 'text-[#86efac]',
  keyword: 'text-[#f9a8d4]',
  number: 'text-[#fef08a]',
  flag: 'text-[#93c5fd]',
  variable: 'text-[#fdba74]',
  key: 'text-[#93c5fd]',
};

const KEYWORDS = new Set([
  'const', 'let', 'var', 'await', 'async', 'function', 'return', 'if', 'else', 'throw', 'new', 'import',
  'from', 'export', 'switch', 'case', 'default', 'break', 'try', 'catch', 'def', 'raise', 'not', 'and', 'or',
  'in', 'is', 'del', 'elif', 'except', 'package', 'func', 'nil', 'defer', 'echo', 'true', 'false', 'null',
  'True', 'False', 'None', 'curl', 'for', 'while', 'class', 'struct', 'type', 'map',
]);

type Highlighter = (code: string) => React.ReactNode[];

function tokenize(code: string, pattern: RegExp, classify: (m: RegExpExecArray) => string | null): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  pattern.lastIndex = 0;
  while ((m = pattern.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const cls = classify(m);
    out.push(cls ? <span key={m.index} className={cls}>{m[0]}</span> : m[0]);
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  return out;
}

const highlightCode: Highlighter = (code) =>
  tokenize(
    code,
    /(\/\/[^\n]*|(?:^|\s)#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\s-{1,2}[A-Za-z][\w-]*)|(\$[A-Za-z_]\w*)|\b(\d[\d_]*(?:\.\d+)?)\b|\b([A-Za-z_]\w*)\b/g,
    (m) => {
      if (m[1]) return C.comment;
      if (m[2]) return C.string;
      if (m[3]) return C.flag;
      if (m[4]) return C.variable;
      if (m[5]) return C.number;
      if (m[6] && KEYWORDS.has(m[6])) return C.keyword;
      return null;
    },
  );

const highlightJson: Highlighter = (json) =>
  tokenize(json, /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g, (m) =>
    m[1] ? C.key : m[2] ? C.string : C.number,
  );

const highlightPlain: Highlighter = (text) =>
  tokenize(text, /(#[^\n]*)|^([\w-]+)(?=\s*[:=])/gm, (m) => (m[1] ? C.comment : C.key));

const HIGHLIGHTERS: Record<CodeKind, Highlighter> = {
  code: highlightCode,
  json: highlightJson,
  plain: highlightPlain,
};

// ---------------------------------------------------------------------------
// Preferred language, shared by every code panel and remembered across visits
// ---------------------------------------------------------------------------

const LANG_KEY = 'wa-docs-lang';
const LANG_EVENT = 'wa-docs-lang-change';

function subscribeLang(callback: () => void) {
  window.addEventListener(LANG_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(LANG_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function readLang(): string | null {
  try {
    return localStorage.getItem(LANG_KEY);
  } catch {
    return null;
  }
}

function writeLang(lang: string) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Storage unavailable (private mode); the choice just isn't remembered.
  }
  window.dispatchEvent(new Event(LANG_EVENT));
}

function usePreferredLang() {
  return useSyncExternalStore(subscribeLang, readLang, () => null);
}

// ---------------------------------------------------------------------------
// Code panel
// ---------------------------------------------------------------------------

export type CodeKind = 'code' | 'json' | 'plain';

export interface CodeTab {
  id: string;
  label: string;
  code: string;
  kind?: CodeKind;
}

export function CodePanel({
  title,
  status,
  tabs,
  kind = 'code',
  syncLanguage = false,
}: {
  /** Shown in the header, e.g. "POST /send-otp" or "Response". */
  title?: string;
  status?: { text: string; ok: boolean };
  tabs: CodeTab[];
  kind?: CodeKind;
  /** When true, tab ids are languages and switching one switches every synced panel on the page. */
  syncLanguage?: boolean;
}) {
  const preferredLang = usePreferredLang();
  const [localTab, setLocalTab] = useState(tabs[0].id);
  const [copied, setCopied] = useState(false);

  const activeId = syncLanguage
    ? (tabs.find((t) => t.id === preferredLang) ?? tabs[0]).id
    : localTab;
  const current = tabs.find((t) => t.id === activeId) ?? tabs[0];

  const selectTab = (id: string) => (syncLanguage ? writeLang(id) : setLocalTab(id));

  // Size the code area for the longest tab (capped at 440px) so switching tabs never changes
  // the panel's height, and nothing on the page moves. Longer code scrolls inside the panel.
  const maxLines = Math.max(...tabs.map((t) => t.code.split('\n').length));
  const codeHeight = `min(calc(${maxLines * 1.7}em + 2rem), 440px)`;

  const handleCopy = () => {
    copyToClipboard(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const highlight = HIGHLIGHTERS[current.kind ?? kind];

  const copyButton = (
    <button
      onClick={handleCopy}
      aria-label="Copy code"
      className="font-mono text-[10px] font-extrabold text-[#d4d4d4] border border-[#524d43] px-2 py-1 hover:border-[#fbf8f1] hover:text-[#fbf8f1] cursor-pointer shrink-0"
    >
      {copied ? '✓ COPIED' : 'COPY'}
    </button>
  );
  // A single tab with a title needs no tab bar; the copy button moves into the title bar.
  const showTabs = tabs.length > 1 || !title;

  return (
    <div className="border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] shadow-[5px_5px_0px_#7a2020] min-w-0">
      {title && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#333333] bg-[#222222]">
          <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-[#d4d4d4] truncate">{title}</span>
          <div className="flex items-center gap-2 shrink-0">
            {status && (
              <span
                className={`font-mono text-[10px] font-extrabold px-1.5 py-0.5 ${
                  status.ok ? 'bg-[#2e6930] text-[#fbf8f1]' : 'bg-[#7a2020] text-[#fbf8f1]'
                }`}
              >
                {status.text}
              </span>
            )}
            {!showTabs && copyButton}
          </div>
        </div>
      )}
      {showTabs && (
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-[#333333] bg-[#1f1f1f]">
          <div className="flex flex-wrap gap-0.5 min-w-0" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={t.id === activeId}
                onClick={() => selectTab(t.id)}
                className={`font-mono text-[10.5px] font-bold px-2 py-1 cursor-pointer transition-colors ${
                  t.id === activeId
                    ? 'bg-[#fbf8f1] text-[#1a1a1a]'
                    : 'text-[#a3a3a3] hover:text-[#fbf8f1] hover:bg-[#2a2a2a]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {copyButton}
        </div>
      )}
      <pre
        style={{ height: codeHeight }}
        className="code-scroll m-0 p-4 overflow-auto overscroll-contain font-mono text-[12.5px] leading-[1.7]"
      >
        <code>{highlight(current.code)}</code>
      </pre>
    </div>
  );
}

/**
 * Two columns on wide screens: explanation on the left, code on the right.
 * The code column scrolls with its section (no sticky), so it never "freezes" mid-scroll.
 */
export function Split({ children, aside }: { children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-8 items-start">
      <div className="min-w-0">{children}</div>
      <div className="grid gap-5 min-w-0">{aside}</div>
    </div>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="relative border-l-2 border-[#1a1a1a] ml-3.5 space-y-8">{children}</ol>;
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="relative pl-8">
      <span className="absolute -left-[15px] top-0 inline-flex w-7 h-7 items-center justify-center bg-[#1a1a1a] text-[#fbf8f1] font-mono text-xs font-extrabold">
        {n}
      </span>
      <div className="font-mono text-sm font-extrabold text-[#1a1a1a] mb-2 pt-1">{title}</div>
      <div className="min-w-0">{children}</div>
    </li>
  );
}
