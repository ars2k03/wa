'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { MessageLog } from '@/lib/types';

export function useMessageLogs(sessionId?: string, autoRefresh: boolean = true) {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.getMessageLogs(sessionId);
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch message logs');
    }
  }, [sessionId]);

  useEffect(() => {
    setLoading(true);
    fetchLogs().finally(() => setLoading(false));

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchLogs, autoRefresh]);

  return {
    logs,
    loading,
    error,
    refreshLogs: fetchLogs,
  };
}
