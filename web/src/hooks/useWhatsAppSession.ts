'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { SessionInfo, WhatsAppConnectionStatus } from '@/types/types';

// Poll fast while the user is mid-link so the result shows up quickly; slow down otherwise
const FAST_POLL_MS = 1500;
const SLOW_POLL_MS = 5000;

export function useWhatsAppSession(initialSessionId: string = 'default') {
  const [sessionId, setSessionId] = useState<string>(initialSessionId);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingLoading, setPairingLoading] = useState<boolean>(false);
  const [hasFetchedInitialStatus, setHasFetchedInitialStatus] = useState<boolean>(false);

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async (): Promise<WhatsAppConnectionStatus | undefined> => {
    try {
      const res = await api.getSessionStatus(sessionId);
      if (res.success && res.data) {
        setSessionInfo(res.data);
        setError(null);
        return res.data.status;
      }
    } catch (err: any) {
      // Session might not be initialized yet
      setError(err?.message || 'Failed to fetch session status');
    } finally {
      setHasFetchedInitialStatus(true);
    }
    return undefined;
  }, [sessionId]);

  const initSession = useCallback(
    async (userId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.initSession(sessionId, userId);
        if (res.success && res.data) {
          setSessionInfo(res.data);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize session');
      } finally {
        setLoading(false);
      }
    },
    [sessionId],
  );

  const requestPairing = useCallback(
    async (phoneNumber: string) => {
      setPairingLoading(true);
      setError(null);
      try {
        const res = await api.requestPairingCode(sessionId, phoneNumber);
        if (res.success && res.data?.pairingCode) {
          setPairingCode(res.data.pairingCode);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to generate pairing code');
      } finally {
        setPairingLoading(false);
      }
    },
    [sessionId],
  );

  const deleteSession = useCallback(async () => {
    setLoading(true);
    try {
      await api.deleteSession(sessionId);
      setSessionInfo((prev) =>
        prev
          ? {
            ...prev,
            status: 'disconnected' as WhatsAppConnectionStatus,
            qr: null,
            qrRaw: null,
            linking: false,
            qrRefreshing: false,
            qrExpired: false,
            lastError: null,
          }
          : null,
      );
      setPairingCode(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to disconnect session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Polling loop: chained timeouts so requests never overlap, with an adaptive interval
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const s = await fetchStatus();
      if (cancelled) return;
      const delay = s === 'qr_ready' || s === 'connecting' ? FAST_POLL_MS : SLOW_POLL_MS;
      pollTimeoutRef.current = setTimeout(tick, delay);
    };

    void tick();

    return () => {
      cancelled = true;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [fetchStatus]);

  return {
    sessionId,
    setSessionId,
    sessionInfo,
    status: sessionInfo?.status || 'disconnected',
    qr: sessionInfo?.qr,
    phoneNumber: sessionInfo?.phoneNumber,
    linking: Boolean(sessionInfo?.linking),
    qrRefreshing: Boolean(sessionInfo?.qrRefreshing),
    qrExpired: Boolean(sessionInfo?.qrExpired),
    sessionError: sessionInfo?.lastError ?? null,
    loading,
    error,
    pairingCode,
    pairingLoading,
    hasFetchedInitialStatus,
    initSession,
    requestPairing,
    deleteSession,
    refreshStatus: fetchStatus,
  };
}
