'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useDashboardTab } from '@/context/DashboardTabContext';
import { copyToClipboard } from '@/utils/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface MessageTesterTabProps {
  userId?: string | null;
  initialKey?: string;
}

interface ErrorDetails {
  status: number;
  errorStatusText: string;
  icon: string;
  title: string;
  message: string;
  actionType?: 'device' | 'keys';
  raw?: any;
}

export function MessageTesterTab({ userId, initialKey }: MessageTesterTabProps) {
  const { setActiveTab } = useDashboardTab();
  const { keys } = useApiKeys(userId);

  const [selectedKey, setSelectedKey] = useState<string>(initialKey || '');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('482910');

  const [transmitting, setTransmitting] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const handleCopyJson = async (data: any) => {
    if (!data) return;
    const success = await copyToClipboard(JSON.stringify(data, null, 2));
    if (success) {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

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
    if (!selectedKey.trim()) {
      setErrorDetails({
        status: 400,
        errorStatusText: 'VALIDATION ERROR',
        icon: '🔑',
        title: 'API Key Required',
        message: 'Please select or generate an API key to authenticate this request.',
        actionType: 'keys',
      });
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorDetails({
        status: 400,
        errorStatusText: 'VALIDATION ERROR',
        icon: '📱',
        title: 'Phone Number Required',
        message: 'Please provide a valid recipient WhatsApp phone number.',
      });
      return;
    }

    setTransmitting(true);
    setErrorDetails(null);
    setResponseOutput(null);
    setLatencyMs(null);

    const startTime = performance.now();

    try {
      const res = await api.sendOtp(selectedKey.trim(), {
        phoneNumber: phoneNumber.trim(),
        otp: otpCode.trim() || '123456',
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setResponseOutput(res);
      setErrorDetails(null);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setResponseOutput(null);

      const status = Number(err?.status) || 500;
      const rawMsg: string = err?.message || 'Request failed';
      const rawData = err?.data || {
        statusCode: status,
        message: rawMsg,
      };

      const lowerMsg = rawMsg.toLowerCase();

      let title = 'Request Failed';
      let message = rawMsg;
      let icon = '⚠️';
      let statusText = `${status} ERROR`;
      let actionType: 'device' | 'keys' | undefined = undefined;

      if (
        status === 503 ||
        lowerMsg.includes('not connected') ||
        lowerMsg.includes('scan qr') ||
        lowerMsg.includes('device')
      ) {
        icon = '📱';
        title = 'WhatsApp Device Offline';
        statusText = '503 SERVICE UNAVAILABLE';
        message =
          'Your WhatsApp device is not connected. Please scan the QR code to connect your device before sending messages.';
        actionType = 'device';
      } else if (
        status === 401 ||
        lowerMsg.includes('unauthorized') ||
        lowerMsg.includes('api key')
      ) {
        icon = '🔑';
        title = 'Authentication Failed';
        statusText = '401 UNAUTHORIZED';
        message =
          'The provided API Key is invalid or inactive. Please choose an active key from the API Keys tab.';
        actionType = 'keys';
      } else if (
        status === 400 &&
        (lowerMsg.includes('phone') || lowerMsg.includes('registered'))
      ) {
        icon = '📞';
        title = 'Recipient Not Found';
        statusText = '400 BAD REQUEST';
        message =
          'The recipient phone number is not registered on WhatsApp or the format is invalid. Please verify the number.';
      } else if (status === 429) {
        icon = '⏳';
        title = 'Rate Limit Exceeded';
        statusText = '429 TOO MANY REQUESTS';
        message = 'Too many requests were sent in a short time. Please wait a few seconds and try again.';
      }

      setErrorDetails({
        status,
        errorStatusText: statusText,
        icon,
        title,
        message,
        actionType,
        raw: rawData,
      });
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
                placeholder="Enter phone number..."
                isMono
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
        <div className="lg:col-span-5">
          <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="border-b-2 border-[#1a1a1a] bg-[#ede5d3] px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                API RESPONSE
              </span>
              <div className="flex items-center gap-2">
                {errorDetails && (
                  <span className="px-2 py-0.5 bg-[#fae8e8] border border-[#7a2020] text-[#7a2020] text-[10px] font-mono font-bold">
                    {errorDetails.status} ERROR
                  </span>
                )}
                {responseOutput && (
                  <span className="px-2 py-0.5 bg-[#eef7ee] border border-[#1b4332] text-[#1b4332] text-[10px] font-mono font-bold">
                    200 OK
                  </span>
                )}
                {latencyMs !== null && (
                  <span className="font-mono text-xs font-bold text-[#524d43]">
                    ⚡ {latencyMs}ms
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 font-mono text-xs flex-1 flex flex-col justify-between space-y-4 min-h-[340px]">
              {errorDetails ? (
                <div className="space-y-4 my-auto">
                  {/* Minimal, clean alert card matching UI */}
                  <div className="p-4 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] space-y-3 shadow-[2px_2px_0px_#7a2020]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#7a2020] text-white flex items-center justify-center text-xs font-bold font-mono">
                        !
                      </span>
                      <span className="font-mono font-bold text-xs uppercase text-[#7a2020] tracking-wide">
                        {errorDetails.title}
                      </span>
                    </div>

                    <p className="font-serif text-xs text-[#524d43] leading-relaxed">
                      {errorDetails.message}
                    </p>

                    {errorDetails.actionType === 'device' && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab('device')}
                        className="text-xs py-1.5"
                      >
                        CONNECT DEVICE NOW →
                      </Button>
                    )}

                    {errorDetails.actionType === 'keys' && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab('keys')}
                        className="text-xs py-1.5"
                      >
                        MANAGE API KEYS →
                      </Button>
                    )}
                  </div>

                  {/* Clean JSON Error Response */}
                  {errorDetails.raw && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#7a2020] uppercase tracking-wider font-bold">
                        <span>JSON Error Response</span>
                        <button
                          type="button"
                          onClick={() => handleCopyJson(errorDetails.raw)}
                          className="px-2 py-0.5 border border-[#1a1a1a] bg-[#fbf8f1] hover:bg-[#ede5d3] text-[#1a1a1a] text-[10px] font-mono font-bold shadow-[1px_1px_0px_#1a1a1a] transition-all cursor-pointer"
                        >
                          {copiedJson ? '✓ COPIED' : 'COPY JSON'}
                        </button>
                      </div>
                      <pre className="p-3.5 bg-[#ede5d3] border-2 border-[#7a2020] font-mono text-xs text-[#7a2020] overflow-x-auto max-h-[160px] overflow-y-auto shadow-[3px_3px_0px_#7a2020] select-all">
                        <code>{JSON.stringify(errorDetails.raw, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : responseOutput ? (
                <div className="space-y-4 my-auto">
                  <div className="p-3.5 bg-[#eef7ee] border-2 border-[#1b4332] text-[#1b4332] flex items-center justify-between shadow-[2px_2px_0px_#1b4332]">
                    <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase text-[#1b4332]">
                      <span className="w-5 h-5 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold font-mono">
                        ✓
                      </span>
                      <span>Message Sent Successfully</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#1b4332] text-white px-2 py-0.5">
                      200 OK
                    </span>
                  </div>

                  {/* Clean JSON Response Viewer */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#524d43] uppercase tracking-wider font-bold">
                      <span>RESPONSE BODY (JSON)</span>
                      <button
                        type="button"
                        onClick={() => handleCopyJson(responseOutput)}
                        className="px-2 py-0.5 border border-[#1a1a1a] bg-[#fbf8f1] hover:bg-[#ede5d3] text-[#1a1a1a] text-[10px] font-mono font-bold shadow-[1px_1px_0px_#1a1a1a] transition-all cursor-pointer"
                      >
                        {copiedJson ? '✓ COPIED' : 'COPY JSON'}
                      </button>
                    </div>
                    <pre className="p-3.5 bg-[#ede5d3] border-2 border-[#1a1a1a] font-mono text-xs text-[#1a1a1a] overflow-x-auto max-h-[220px] overflow-y-auto shadow-[3px_3px_0px_#1a1a1a] select-all">
                      <code>{JSON.stringify(responseOutput, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center my-auto space-y-3 py-8">
                  <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#1a1a1a] bg-[#f4efe2] flex items-center justify-center text-[#1a1a1a]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1a1a1a]">Ready to Test</h4>
                    <p className="font-serif text-xs text-[#524d43] mt-1 max-w-[240px] mx-auto">
                      Fill in the recipient number on the left and click &quot;Send Test Message&quot;.
                    </p>
                  </div>
                </div>
              )}

              {/* Endpoint Specs */}
              <div className="border-t border-[#1a1a1a]/20 pt-3 text-[11px] font-mono text-[#524d43] flex items-center justify-between">
                <span>POST /send-otp</span>
                <span>Auth: x-api-key</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
