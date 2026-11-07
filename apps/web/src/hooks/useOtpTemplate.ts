'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { OtpTemplate, OtpTemplateContent } from '@/types/types';

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

/** The user's single OTP template. `template` is null while the default message is in use. */
export function useOtpTemplate() {
  const [template, setTemplate] = useState<OtpTemplate | null>(null);
  // Starts true: the first fetch runs on mount
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getOtpTemplate()
      .then((res) => {
        if (!cancelled && res.success) setTemplate(res.data.template);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load your OTP template'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Errors are thrown to the caller so the editor can show them inline.
  const saveTemplate = useCallback(async (content: OtpTemplateContent) => {
    const res = await api.saveOtpTemplate(content);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to save OTP template');
    }
    setTemplate(res.data);
    return res.data;
  }, []);

  const resetToDefault = useCallback(async () => {
    await api.deleteOtpTemplate();
    setTemplate(null);
  }, []);

  return { template, loading, error, saveTemplate, resetToDefault };
}
