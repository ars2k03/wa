'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ApiKey } from '@/types/types';

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
    async (name: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.createApiKey({
          userId: userId || undefined,
          name,
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

  const deleteKey = useCallback(async (keyId: string) => {
    try {
      const res = await api.deleteApiKey(keyId);
      if (res.success) {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete key');
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
    deleteKey,
    refreshKeys: fetchKeys,
  };
}
