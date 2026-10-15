'use client';

import React, { useState } from 'react';
import { useUsage } from '@/hooks/useUsage';
import type { UsageSummary, UsageWindow } from '@/types/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

// Usage is counted in Bangladesh time on the server; show dates the same way.
const TIMEZONE = 'Asia/Dhaka';

const fmtNumber = (n: number) => n.toLocaleString('en-US');
const fmtMonthDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: TIMEZONE });
/** History dates are plain "YYYY-MM-DD" days, so read them as UTC to avoid shifting */
const fmtDay = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

type Level = 'ok' | 'warning' | 'full';

function levelOf(w: UsageWindow): Level {
  if (w.used >= w.limit) return 'full';
  if (w.used / w.limit >= 0.8) return 'warning';
  return 'ok';
}

// Status colours always come with a text label, never colour alone
const LEVEL_STYLES: Record<Level, { bar: string; badge: 'emerald' | 'amber' | 'burgundy'; label: string }> = {
  ok: { bar: 'bg-[#2e6930]', badge: 'emerald', label: 'WITHIN LIMIT' },
  warning: { bar: 'bg-[#b45309]', badge: 'amber', label: '⚠ NEAR LIMIT' },
  full: { bar: 'bg-[#7a2020]', badge: 'burgundy', label: '✕ LIMIT REACHED' },
};

function UsageCard({ title, window, resetText }: { title: string; window: UsageWindow; resetText: string }) {
  const level = levelOf(window);
  const style = LEVEL_STYLES[level];
  const percent = Math.min(100, (window.used / window.limit) * 100);
  const left = Math.max(0, window.limit - window.used);

  return (
    <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">{title}</span>
        <Badge variant={style.badge}>{style.label}</Badge>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-serif text-4xl font-black text-[#1a1a1a] tabular-nums">{fmtNumber(window.used)}</span>
        <span className="font-mono text-sm font-bold text-[#524d43] tabular-nums">/ {fmtNumber(window.limit)} OTPs</span>
      </div>

      <div
        role="progressbar"
        aria-label={`${title} usage`}
        aria-valuemin={0}
        aria-valuemax={window.limit}
        aria-valuenow={window.used}
        className="h-3 border-2 border-[#1a1a1a] bg-[#ede5d3]"
      >
        <div className={`h-full ${style.bar} transition-[width] duration-300`} style={{ width: `${percent}%` }} />
      </div>

      <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[#524d43]">
        <span className="tabular-nums">
          <span className="font-bold text-[#1a1a1a]">{fmtNumber(left)}</span> left
        </span>
        <span>{resetText}</span>
      </div>
    </div>
  );
}

function HistoryChart({ usage }: { usage: UsageSummary }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const { history, daily } = usage;
  // Scale to the daily limit so a full bar means a day that hit the limit
  const max = Math.max(daily.limit, ...history.map((d) => d.count));
  const total = history.reduce((sum, d) => sum + d.count, 0);
  const lastIndex = history.length - 1;
  const active = hovered ?? lastIndex;

  return (
    <div className="relative border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] overflow-hidden">
      <div className="border-b-2 border-[#1a1a1a] px-4 py-3 bg-[#ede5d3] flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
          SUCCESSFUL OTPS · LAST {history.length} DAYS
        </span>
        <span className="font-mono text-[11px] text-[#524d43] tabular-nums">{fmtNumber(total)} total</span>
      </div>

      <div className="p-4 sm:p-5">
        {/* Readout for the hovered day (today by default); fixed height so nothing shifts */}
        <div className="h-6 mb-2 font-mono text-xs text-[#524d43] tabular-nums" aria-hidden>
          <span className="font-bold text-[#1a1a1a]">{fmtDay(history[active].date)}</span>
          {active === lastIndex && ' (today)'}: {fmtNumber(history[active].count)} OTPs
        </div>

        <div className="relative h-40" onMouseLeave={() => setHovered(null)} aria-hidden>
          {/* Daily limit line */}
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-[#7a2020]/50 pointer-events-none"
            style={{ bottom: `${(daily.limit / max) * 100}%` }}
          >
            <span className="absolute right-0 -top-5 font-mono text-[10px] font-bold text-[#7a2020]">
              DAILY LIMIT {daily.limit}
            </span>
          </div>

          <div className="absolute inset-0 flex items-end gap-[2px] border-b-2 border-[#1a1a1a]">
            {history.map((d, i) => (
              // The whole column is the hover target, not just the bar
              <div
                key={d.date}
                className="flex-1 h-full flex items-end cursor-default"
                onMouseEnter={() => setHovered(i)}
              >
                <div
                  className={`w-full rounded-t-[4px] transition-colors ${
                    i === active ? 'bg-[#7a2020]' : i === lastIndex ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a]/70'
                  }`}
                  style={{ height: d.count > 0 ? `max(2px, ${(d.count / max) * 100}%)` : '0' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-between font-mono text-[10px] text-[#524d43]" aria-hidden>
          <span>{fmtDay(history[0].date)}</span>
          <span>{fmtDay(history[Math.floor(lastIndex / 2)].date)}</span>
          <span>Today</span>
        </div>

        {/* Screen-reader table view of the same data */}
        <table className="sr-only">
          <caption>Successful OTPs per day, last {history.length} days</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">OTPs</th>
            </tr>
          </thead>
          <tbody>
            {history.map((d) => (
              <tr key={d.date}>
                <td>{fmtDay(d.date)}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UsageTab() {
  const { usage, loading, error, refreshUsage } = useUsage();

  return (
    <div className="space-y-6 w-full">
      <Card
        title="USAGE & LIMITS"
        subtitle="SUCCESSFUL OTPS ON YOUR ACCOUNT"
        variant="tint"
        headerAction={
          <Button variant="secondary" size="sm" onClick={refreshUsage} disabled={loading} className="text-xs">
            ⟳ REFRESH
          </Button>
        }
      >
        <p className="font-serif text-sm text-[#524d43] leading-relaxed">
          Each account can send up to <strong>{fmtNumber(usage?.daily.limit ?? 100)} OTPs a day</strong> and{' '}
          <strong>{fmtNumber(usage?.monthly.limit ?? 3000)} a month</strong>, across all API keys. Only successful
          sends count, including ones from the Playground. Days reset at midnight and months on the 1st, Bangladesh
          time.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold">
            ! ERROR: {error}
          </div>
        )}
      </Card>

      {!usage ? (
        <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] p-12 text-center font-mono text-xs text-[#524d43] flex flex-col items-center justify-center space-y-3">
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
              <span>LOADING USAGE...</span>
            </>
          ) : (
            <span>Usage is not available right now.</span>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UsageCard title="TODAY" window={usage.daily} resetText="Resets at 12:00 AM" />
            <UsageCard
              title="THIS MONTH"
              window={usage.monthly}
              resetText={`Resets on ${fmtMonthDay(usage.monthly.resetsAt)}`}
            />
          </div>

          {(levelOf(usage.daily) === 'full' || levelOf(usage.monthly) === 'full') && (
            <div className="p-3.5 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] text-xs font-serif leading-relaxed">
              <span className="font-bold">Limit reached.</span> New OTP requests return{' '}
              <code className="font-mono font-bold">429</code> until the limit resets.
            </div>
          )}

          <HistoryChart usage={usage} />
        </>
      )}
    </div>
  );
}
