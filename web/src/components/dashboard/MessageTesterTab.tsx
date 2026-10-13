'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useApiKeys } from '@/hooks/useApiKeys';
import type { SendOtpResult } from '@/lib/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface MessageTesterTabProps {
  userId?: string | null;
  initialKey?: string;
}

export function MessageTesterTab({ userId, initialKey }: MessageTesterTabProps) {
  const { keys } = useApiKeys(userId);

  const [selectedKey, setSelectedKey] = useState<string>(initialKey || '');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('482910');
  const [targetSessionId, setTargetSessionId] = useState<string>('default');

  const [transmitting, setTransmitting] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set default key when keys load
  useEffect(() => {
    if (!selectedKey && keys.length > 0) {
      const activeKey = keys.find((k) => k.isActive);
      if (activeKey) {
        setSelectedKey(activeKey.key);
        if (activeKey.sessionId) {
          setTargetSessionId(activeKey.sessionId);
        }
      }
    }
  }, [keys, selectedKey]);

  useEffect(() => {
    if (initialKey) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey.trim() || !phoneNumber.trim() || !otpCode.trim()) {
      setError('Please provide API Key, Telephone Number, and OTP Code');
      return;
    }

    setTransmitting(true);
    setError(null);
    setResponseOutput(null);
    setLatencyMs(null);

    const startTime = performance.now();

    try {
      const res = await api.sendOtp(selectedKey.trim(), {
        phoneNumber: phoneNumber.trim(),
        otp: otpCode.trim(),
        sessionId: targetSessionId.trim() || undefined,
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setResponseOutput(res);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setError(err?.message || 'Dispatch failed over network');
    } finally {
      setTransmitting(false);
    }
  };

  const generateRandomOtp = () => {
    const num = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(num);
  };

  return (
    <div className="space-y-8">
      {/* Intro Card */}
      <Card
        title="LIVE TELEGRAPH DISPATCH ORDER FORM"
        subtitle="SUBMIT TEST PACKETS DIRECTLY TO WHATSAPP RECIPIENTS"
        variant="tint"
        headerAction={
          <Badge variant="emerald" rotate="left">
            LIVE REST CLIENT
          </Badge>
        }
      >
        <p className="font-serif text-sm text-[#524d43] leading-relaxed">
          Formulated in the style of early 20th-century classified telegraph transmission orders. Fill in the recipient phone number and token code to fire an authenticated HTTP request to the running backend service.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] p-6 space-y-6">
            <div className="border-b-2 border-[#1a1a1a] pb-3 flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                ORDER SPECIFICATION FORM
              </span>
              <span className="font-mono text-xs text-[#7a2020] font-bold">
                WIRE: /send-otp
              </span>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4">
              {/* API Key selector or input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] font-mono flex justify-between">
                  <span>AUTHENTICATING API KEY (x-api-key)</span>
                  <span className="text-[#7a2020]">* REQUIRED</span>
                </label>

                {keys.length > 0 && (
                  <select
                    className="w-full mb-2 px-3 py-2 bg-[#f4efe2] border-2 border-[#1a1a1a] font-mono text-xs focus:outline-none"
                    value={selectedKey}
                    onChange={(e) => {
                      setSelectedKey(e.target.value);
                      const matched = keys.find((k) => k.key === e.target.value);
                      if (matched?.sessionId) setTargetSessionId(matched.sessionId);
                    }}
                  >
                    <option value="">-- SELECT FROM YOUR ACTIVE KEYS --</option>
                    {keys
                      .filter((k) => k.isActive)
                      .map((k) => (
                        <option key={k.id} value={k.key}>
                          {k.name} ({k.key.slice(0, 16)}...)
                        </option>
                      ))}
                  </select>
                )}

                <Input
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  placeholder="_ars_2k03_..."
                  isMono
                  required
                />
              </div>

              {/* Target Session */}
              <Input
                label="WHATSAPP SESSION IDENTIFIER"
                value={targetSessionId}
                onChange={(e) => setTargetSessionId(e.target.value)}
                placeholder="default"
                isMono
                helperText="Session linked to the apparatus (default if unspecified)"
              />

              {/* Recipient Phone */}
              <Input
                label="RECIPIENT TELEPHONE NUMBER"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+8801700000000"
                isMono
                helperText="Must include country code (e.g. +880 for Bangladesh, +1 for US)"
                required
              />

              {/* OTP Code with Randomize button */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] font-mono">
                    OTP CODE / SECURITY PIN
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomOtp}
                    className="text-[11px] font-mono font-bold text-[#7a2020] hover:underline cursor-pointer"
                  >
                    [RANDOMIZE PIN]
                  </button>
                </div>
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-digit pin"
                  isMono
                  required
                />
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-[4px_4px_0px_#1a1a1a]"
                  isLoading={transmitting}
                >
                  TRANSMIT TELEGRAM (SEND OTP) →
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Output Inspection Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-3 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] flex flex-col h-full">
            {/* Header */}
            <div className="border-b-2 border-[#333333] bg-[#222222] px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#fbf8f1]">
                TELEGRAPH RECEIVER TAPE
              </span>
              {latencyMs !== null && (
                <span className="font-mono text-xs font-bold text-[#84cc16]">
                  LATENCY: {latencyMs}ms
                </span>
              )}
            </div>

            <div className="p-5 font-mono text-xs flex-1 flex flex-col justify-between space-y-4 min-h-[360px]">
              {error ? (
                <div className="p-3 bg-[#3f1212] border border-[#ef4444] text-[#fca5a5] space-y-1">
                  <div className="font-bold">TRANSMISSION FAILED</div>
                  <div>{error}</div>
                </div>
              ) : responseOutput ? (
                <div className="space-y-3">
                  <div className="text-[#84cc16] font-bold">
                    ✓ STATUS 200 OK — WIRE TRANSMITTED
                  </div>
                  <pre className="bg-[#111111] p-3 border border-[#333333] text-[#38bdf8] overflow-x-auto max-h-[220px] overflow-y-auto">
                    <code>{JSON.stringify(responseOutput, null, 2)}</code>
                  </pre>
                  <div className="text-[#a3a3a3] text-[11px]">
                    Message ID was stored in audit ledger and forwarded over Baileys socket.
                  </div>
                </div>
              ) : (
                <div className="text-[#737373] italic py-12 text-center my-auto">
                  Awaiting dispatch submission... Press &quot;Transmit Telegram&quot; to inspect returned packet.
                </div>
              )}

              {/* Static Reference Box */}
              <div className="border-t border-[#333333] pt-3 text-[11px] text-[#a3a3a3] space-y-1">
                <div>GATEWAY: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}</div>
                <div>METHOD: POST /send-otp</div>
                <div>AUTH: x-api-key</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
