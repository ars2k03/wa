'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { SessionInfo, WhatsAppConnectionStatus } from '@/lib/types';

export function useWhatsAppSession(initialSessionId: string = 'default') {
  const [sessionId, setSessionId] = useState<string>(initialSessionId);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingLoading, setPairingLoading] = useState<boolean>(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.getSessionStatus(sessionId);
      if (res.success && res.data) {
        setSessionInfo(res.data);
        setError(null);
      }
    } catch (err: any) {
      // Session might not be initialized yet
      setError(err?.message || 'Failed to fetch session status');
    }
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

  // Polling loop: poll every 2500ms
  useEffect(() => {
    fetchStatus();

    pollIntervalRef.current = setInterval(() => {
      fetchStatus();
    }, 2500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
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
    loading,
    error,
    pairingCode,
    pairingLoading,
    initSession,
    requestPairing,
    deleteSession,
    refreshStatus: fetchStatus,
  };
}
