'use client';

import React, { useState } from 'react';
import { useMessageLogs } from '@/hooks/useMessageLogs';
import { formatDate } from '@/lib/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

export function MessageLogsTab() {
  const [filterText, setFilterText] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const { logs, loading, error, refreshLogs } = useMessageLogs(undefined, autoRefresh);

  const filteredLogs = logs.filter((log) => {
    if (!filterText.trim()) return true;
    const term = filterText.toLowerCase();
    return (
      log.recipient.toLowerCase().includes(term) ||
      log.sessionId.toLowerCase().includes(term) ||
      (log.messageId && log.messageId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <Card
        title="TRANSACTIONAL MESSAGE AUDIT LEDGER"
        subtitle="COMPLETE HISTORICAL LOG OF DISPATCHED TELEGRAMS"
        variant="tint"
        headerAction={
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="accent-[#7a2020]"
              />
              AUTO-POLL (4s)
            </label>
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshLogs}
              className="text-xs py-1"
            >
              ⟳ REFRESH
            </Button>
          </div>
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-serif text-sm text-[#524d43]">
            Every message dispatched through this gateway is registered into PostgreSQL with unique message identifiers and timestamp records.
          </p>
          <div className="w-full sm:w-72">
            <Input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by phone or session..."
              isMono
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold">
            ! ERROR: {error}
          </div>
        )}
      </Card>

      {/* Ledger Ruled Table */}
      <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] overflow-hidden">
        <div className="border-b-2 border-[#1a1a1a] px-4 py-3 bg-[#ede5d3] flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
            OFFICIAL DISPATCH LOGS ({filteredLogs.length} OF {logs.length})
          </span>
          <span className="font-mono text-xs text-[#524d43]">
            FORMAT: RFC-3339 / UTC
          </span>
        </div>

        {loading && logs.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-[#524d43]">
            RETRIEVING DISPATCH AUDIT LOGS...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center font-serif text-sm text-[#524d43]">
            {logs.length === 0
              ? 'No messages have been dispatched yet. Send your first test OTP from the "Live Tester" tab.'
              : 'No log entries match the search filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a] bg-[#f4efe2] text-xs font-mono uppercase text-[#1a1a1a]">
                  <th className="p-3 border-r border-[#1a1a1a]">DISPATCH TIME</th>
                  <th className="p-3 border-r border-[#1a1a1a]">RECIPIENT TELEPHONE</th>
                  <th className="p-3 border-r border-[#1a1a1a]">TYPE</th>
                  <th className="p-3 border-r border-[#1a1a1a]">SESSION ID</th>
                  <th className="p-3 border-r border-[#1a1a1a]">MESSAGE ID</th>
                  <th className="p-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a] text-xs font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f4efe2] transition-colors">
                    <td className="p-3 border-r border-[#1a1a1a] text-[#524d43]">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="p-3 border-r border-[#1a1a1a] font-bold text-[#1a1a1a]">
                      {log.recipient}
                    </td>

                    <td className="p-3 border-r border-[#1a1a1a]">
                      <span className="bg-[#ede5d3] px-1.5 py-0.5 border border-[#1a1a1a] uppercase text-[10px] font-bold">
                        {log.messageType}
                      </span>
                    </td>

                    <td className="p-3 border-r border-[#1a1a1a]">
                      <Badge variant="neutral">{log.sessionId}</Badge>
                    </td>

                    <td className="p-3 border-r border-[#1a1a1a] text-[#524d43] font-mono select-all text-[11px]">
                      {log.messageId || '—'}
                    </td>

                    <td className="p-3 text-right">
                      <Badge
                        variant={
                          log.status === 'sent' || log.status === 'delivered'
                            ? 'emerald'
                            : 'burgundy'
                        }
                      >
                        {log.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
