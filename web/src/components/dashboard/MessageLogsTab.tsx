'use client';

import React, { useState } from 'react';
import { useMessageLogs } from '@/hooks/useMessageLogs';
import { copyToClipboard, formatDate } from '@/utils/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function MessageLogsTab() {
  const [filterText, setFilterText] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { logs, loading, error, refreshLogs } = useMessageLogs(undefined, autoRefresh);

  const filteredLogs = logs.filter((log) => {
    if (!filterText.trim()) return true;
    const term = filterText.toLowerCase();
    return (
      log.recipient.toLowerCase().includes(term) ||
      (log.messageId && log.messageId.toLowerCase().includes(term))
    );
  });

  const handleCopyMessageId = async (id: string) => {
    const success = await copyToClipboard(id);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#ede5d3] p-3 border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search by recipient phone or message ID..."
            className="w-full px-3 py-2 bg-[#fbf8f1] border-2 border-[#1a1a1a] font-mono text-xs text-[#1a1a1a] placeholder:text-[#524d43]/60 focus:outline-none shadow-[2px_2px_0px_#1a1a1a]"
          />
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#524d43] hover:text-[#1a1a1a]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Refresh & Auto-poll Controls */}
        <div className="flex items-center gap-3 justify-end">
          <label className="flex items-center gap-2 text-xs font-mono font-bold text-[#1a1a1a] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-[#1b4332] w-3.5 h-3.5"
            />
            AUTO-REFRESH
          </label>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshLogs}
            disabled={loading}
            className="text-xs py-1.5 px-3"
          >
            ⟳ REFRESH
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold">
          ! ERROR: {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] overflow-hidden">
        <div className="border-b-2 border-[#1a1a1a] px-4 py-3 bg-[#ede5d3] flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
            DELIVERY LOGS ({filteredLogs.length} OF {logs.length})
          </span>
          <span className="text-[11px] font-mono text-[#524d43]">
            PostgreSQL Ledger
          </span>
        </div>

        {loading && logs.length === 0 ? (
          <div className="p-12 text-center font-mono text-xs text-[#524d43] flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            <span>LOADING LOGS...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#1a1a1a] bg-[#f4efe2] flex items-center justify-center text-[#1a1a1a]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[#1a1a1a]">
                {logs.length === 0 ? 'No messages sent yet' : 'No matching logs found'}
              </h4>
              <p className="font-serif text-sm text-[#524d43] mt-1 max-w-md mx-auto">
                {logs.length === 0
                  ? 'Messages sent from the Playground or external API requests will automatically appear here.'
                  : 'Try searching with a different phone number or clear the search filter.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a] bg-[#f4efe2] text-xs font-mono uppercase text-[#1a1a1a]">
                  <th className="p-3.5 border-r border-[#1a1a1a]">RECIPIENT</th>
                  <th className="p-3.5 border-r border-[#1a1a1a]">TYPE</th>
                  <th className="p-3.5 border-r border-[#1a1a1a]">DATE & TIME</th>
                  <th className="p-3.5 border-r border-[#1a1a1a]">MESSAGE ID</th>
                  <th className="p-3.5 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a] text-xs font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f4efe2] transition-colors">
                    <td className="p-3.5 border-r border-[#1a1a1a] font-bold text-[#1a1a1a]">
                      {log.recipient}
                    </td>

                    <td className="p-3.5 border-r border-[#1a1a1a]">
                      <span className="bg-[#ede5d3] px-2 py-0.5 border border-[#1a1a1a]/40 uppercase text-[10px] font-bold">
                        {log.messageType || 'OTP'}
                      </span>
                    </td>

                    <td className="p-3.5 border-r border-[#1a1a1a] text-[#524d43]">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="p-3.5 border-r border-[#1a1a1a] text-[#524d43]">
                      {log.messageId ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-[#1a1a1a] font-semibold select-all">
                            {log.messageId.length > 20
                              ? `${log.messageId.slice(0, 10)}...${log.messageId.slice(-8)}`
                              : log.messageId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyMessageId(log.messageId!)}
                            className="text-[10px] px-1.5 py-0.5 border border-[#1a1a1a] bg-[#fbf8f1] hover:bg-[#ede5d3] font-bold cursor-pointer"
                            title="Copy full message ID"
                          >
                            {copiedId === log.messageId ? '✓' : 'COPY'}
                          </button>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="p-3.5 text-right">
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
