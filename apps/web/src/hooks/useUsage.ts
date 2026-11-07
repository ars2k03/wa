'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { UsageSummary } from '@/types/types';

const REFRESH_MS = 15000;

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

/** Daily/monthly OTP usage, refreshed in the background while the tab is open */
export function useUsage() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  // Starts true: the first fetch runs on mount
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api.getUsage().then((res) => {
        if (res.success) {
          setUsage(res.data);
          setError(null);
        }
      }),
    [],
  );

  // State is only set after each request resolves, and ignored after unmount
  useEffect(() => {
    let cancelled = false;
    const run = () =>
      load()
        .catch((err) => {
          if (!cancelled) setError(errorMessage(err, 'Failed to load usage'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

    run();
    const interval = setInterval(run, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [load]);

  const refreshUsage = useCallback(async () => {
    setLoading(true);
    try {
      await load();
    } catch (err) {
      setError(errorMessage(err, 'Failed to load usage'));
    } finally {
      setLoading(false);
    }
  }, [load]);

  return { usage, loading, error, refreshUsage };
}
