'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ApiKey } from '@/lib/types';

export function useApiKeys(userId?: string | null) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUserApiKeys(userId);
      if (res.success && Array.isArray(res.data)) {
        setKeys(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createKey = useCallback(
    async (name: string, sessionId?: string) => {
      if (!userId) throw new Error('User ID is required to generate API key');
      setLoading(true);
      setError(null);
      try {
        const res = await api.createApiKey({
          userId,
          name,
          sessionId,
        });
        if (res.success && res.data) {
          setKeys((prev) => [res.data, ...prev]);
          return res.data;
        } else {
          throw new Error(res.message || 'Failed to create API key');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to create API key');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const linkSession = useCallback(
    async (keyId: string, sessionId: string) => {
      try {
        const res = await api.linkSessionToKey(keyId, sessionId);
        if (res.success && res.data) {
          setKeys((prev) =>
            prev.map((k) => (k.id === keyId ? res.data : k)),
          );
          return res.data;
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to link session');
        throw err;
      }
    },
    [],
  );

  const revokeKey = useCallback(async (keyId: string) => {
    try {
      const res = await api.revokeApiKey(keyId);
      if (res.success) {
        setKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, isActive: false } : k)),
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to revoke key');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchKeys();
    }
  }, [userId, fetchKeys]);

  return {
    keys,
    loading,
    error,
    createKey,
    linkSession,
    revokeKey,
    refreshKeys: fetchKeys,
  };
}
