'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useDashboardTab } from '@/context/DashboardTabContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface MessageTesterTabProps {
  userId?: string | null;
  initialKey?: string;
}

export function MessageTesterTab({ userId, initialKey }: MessageTesterTabProps) {
  const { setActiveTab } = useDashboardTab();
  const { keys, loading: keysLoading } = useApiKeys(userId);

  const [selectedKey, setSelectedKey] = useState<string>(initialKey || '');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('482910');

  const [transmitting, setTransmitting] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set default active key when keys load
  useEffect(() => {
    if (!selectedKey && keys.length > 0) {
      const activeKey = keys.find((k) => k.isActive);
      if (activeKey) {
        setSelectedKey(activeKey.key);
      }
    }
  }, [keys, selectedKey]);

  useEffect(() => {
    if (initialKey) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);

  const generateRandomOtp = () => {
    const num = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(num);
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey.trim() || !phoneNumber.trim() || !otpCode.trim()) {
      setError('Please provide API Key, Phone Number, and OTP Code');
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
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setResponseOutput(res);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setError(err?.message || 'Failed to send message over network');
    } finally {
      setTransmitting(false);
    }
  };

  const activeKeys = keys.filter((k) => k.isActive);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Test Form */}
        <div className="lg:col-span-7">
          <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] p-6 space-y-5">
            <div className="border-b-2 border-[#1a1a1a] pb-3 flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                MESSAGE CONFIGURATION
              </span>
              <span className="font-mono text-[11px] text-[#1b4332] font-bold">
                POST /send-otp
              </span>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4">
              {/* API Key Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] font-mono flex justify-between">
                  <span>API KEY</span>
                  <span className="text-[#7a2020]">* REQUIRED</span>
                </label>

                {activeKeys.length > 0 ? (
                  <select
                    className="w-full px-3 py-2.5 bg-[#f4efe2] border-2 border-[#1a1a1a] font-mono text-xs font-bold text-[#1a1a1a] focus:outline-none shadow-[2px_2px_0px_#1a1a1a]"
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                  >
                    <option value="">-- SELECT AN API KEY --</option>
                    {activeKeys.map((k) => (
                      <option key={k.id} value={k.key}>
                        {k.name} ({k.key.slice(0, 16)}...)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-xs font-mono text-[#7a2020] flex items-center justify-between gap-2">
                    <span>
                      No active API keys found. Please create one in the{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('keys')}
                        className="font-bold underline hover:text-[#5a1515] cursor-pointer"
                      >
                        API Keys
                      </button>{' '}
                      tab first.
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('keys')}
                      className="px-2.5 py-1 bg-[#7a2020] hover:bg-[#5a1515] text-white text-[11px] font-mono font-bold whitespace-nowrap shadow-[2px_2px_0px_#1a1a1a] transition-all cursor-pointer"
                    >
                      GO TO API KEYS →
                    </button>
                  </div>
                )}
              </div>

              {/* Recipient Phone Number */}
              <Input
                label="RECIPIENT PHONE NUMBER"
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
                    OTP CODE
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomOtp}
                    className="text-[11px] font-mono font-bold text-[#1b4332] hover:underline cursor-pointer"
                  >
                    ⟳ GENERATE RANDOM PIN
                  </button>
                </div>
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-digit code"
                  isMono
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-[4px_4px_0px_#1a1a1a] text-xs font-mono font-bold"
                  isLoading={transmitting}
                  disabled={!selectedKey}
                >
                  SEND TEST MESSAGE →
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Response Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-3 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="border-b-2 border-[#333333] bg-[#222222] px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#fbf8f1]">
                API RESPONSE
              </span>
              {latencyMs !== null && (
                <span className="font-mono text-xs font-bold text-[#84cc16]">
                  ⚡ {latencyMs}ms
                </span>
              )}
            </div>

            <div className="p-5 font-mono text-xs flex-1 flex flex-col justify-between space-y-4 min-h-[340px]">
              {error ? (
                <div className="p-3.5 bg-[#3f1212] border border-[#ef4444] text-[#fca5a5] space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>✕</span> DELIVERY FAILED
                  </div>
                  <div className="text-[11px]">{error}</div>
                </div>
              ) : responseOutput ? (
                <div className="space-y-3">
                  <div className="text-[#84cc16] font-bold flex items-center gap-1.5 text-xs">
                    <span>✓</span> 200 OK — MESSAGE SENT
                  </div>
                  <pre className="bg-[#111111] p-3 border border-[#333333] text-[#38bdf8] overflow-x-auto max-h-[220px] overflow-y-auto text-[11px]">
                    <code>{JSON.stringify(responseOutput, null, 2)}</code>
                  </pre>
                  <div className="text-[#a3a3a3] text-[11px]">
                    Check your recipient device to confirm arrival.
                  </div>
                </div>
              ) : (
                <div className="text-[#737373] py-12 text-center my-auto space-y-2">
                  <div className="text-2xl">💬</div>
                  <div className="font-bold text-[#a3a3a3]">Ready to Test</div>
                  <div className="text-[11px] max-w-[220px] mx-auto">
                    Enter a phone number and click &quot;Send Test Message&quot; to inspect response.
                  </div>
                </div>
              )}

              {/* Endpoint Specs */}
              <div className="border-t border-[#333333] pt-3 text-[11px] text-[#a3a3a3] space-y-1">
                <div>ENDPOINT: POST /send-otp</div>
                <div>HEADER: x-api-key: [Your API Key]</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
