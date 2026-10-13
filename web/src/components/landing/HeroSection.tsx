'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface RealResponseState {
  status: number;
  statusText: string;
  data: any;
  latencyMs: number;
}

export function HeroSection() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  const { user, isAuthenticated } = useAuth();

  const [testPhone, setTestPhone] = useState('+8801700000000');
  const [testOtp, setTestOtp] = useState('4829');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [realResponse, setRealResponse] = useState<RealResponseState | null>(null);

  // Auto-fill active API key if user is logged in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      api
        .getUserApiKeys(user.id)
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            const activeKey = res.data.find((k) => k.isActive) || res.data[0];
            if (activeKey) {
              setApiKey(activeKey.key);
            }
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  const handleExecuteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRealResponse(null);

    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey.trim()) {
        headers['x-api-key'] = apiKey.trim();
      }

      const res = await fetch(`${apiUrl}/send-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phoneNumber: testPhone.trim(),
          otp: testOtp.trim(),
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      let data: any;

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text };
      }

      setRealResponse({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : 'Error'),
        data,
        latencyMs,
      });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      setRealResponse({
        status: 0,
        statusText: 'Connection Error',
        data: {
          error: err?.message || 'Failed to reach gateway server',
          endpoint: `${apiUrl}/send-otp`,
          hint: 'Ensure your backend server is running and accessible.',
        },
        latencyMs,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative border-b-2 border-[#1a1a1a] bg-[#fbf8f1] px-4 py-12 md:py-18">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Headlines, Copy & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="burgundy">Modern</Badge>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-black text-[#1a1a1a] leading-[1.08] tracking-tight">
            WhatsApp API for Developers
          </h1>

          <p className="font-serif text-lg text-[#524d43] leading-relaxed max-w-2xl">
            Connect in seconds, generate API keys, and automate OTPs &amp; alerts via simple REST endpoints. Built for reliability without high vendor pricing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/register">
              <Button variant="primary" size="lg" className="shadow-[4px_4px_0px_#1a1a1a]">
                Get Started Free →
              </Button>
            </Link>
            <a
              href="#docs"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('docs');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  window.history.pushState(null, '', '#docs');
                }
              }}
            >
              <Button variant="outline" size="lg">
                Read Docs
              </Button>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-[#1a1a1a]">
            <div>
              <div className="font-mono text-2xl font-black text-[#7a2020]">&lt; 150ms</div>
              <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                Average Latency
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-[#2e6930]">99.9%</div>
              <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                System Uptime
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-[#1a1a1a]">ZERO</div>
              <div className="font-mono text-[11px] text-[#524d43] uppercase tracking-wider">
                Per-Message Markups
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Workable Terminal / API Preview */}
        <div className="lg:col-span-5">
          <div className="border-2 border-[#1a1a1a] bg-[#f4efe2] shadow-[6px_6px_0px_#1a1a1a]">
            {/* Terminal Header */}
            <div className="border-b-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="font-mono text-xs font-bold tracking-wider ml-1 text-[#d4d4d4]">
                  cURL Request Preview
                </span>
              </div>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#22c55e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                POST /send-otp
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Dynamic Code Snippet Box */}
              <div className="bg-[#1a1a1a] text-[#fbf8f1] p-3.5 border-2 border-[#1a1a1a] font-mono text-xs overflow-x-auto leading-relaxed shadow-[2px_2px_0px_#524d43]">
                <div className="text-[#a3a3a3]"># Live cURL command (matches form inputs below)</div>
                <div className="text-[#fca5a5]">curl -X POST &quot;{apiUrl}/send-otp&quot; \</div>
                <div className="pl-3 text-[#fef08a]">
                  -H &quot;x-api-key: {apiKey ? apiKey : 'your_api_key_here'}&quot; \
                </div>
                <div className="pl-3 text-[#93c5fd]">-H &quot;Content-Type: application/json&quot; \</div>
                <div className="pl-3 text-[#d8b4fe]">-d &#39;&#123;</div>
                <div className="pl-6 text-[#86efac]">&quot;phoneNumber&quot;: &quot;{testPhone}&quot;,</div>
                <div className="pl-6 text-[#86efac]">&quot;otp&quot;: &quot;{testOtp}&quot;</div>
                <div className="pl-3 text-[#d8b4fe]">&#125;&#39;</div>
              </div>

              {/* Workable Interactive Form */}
              <form onSubmit={handleExecuteRequest} className="space-y-3 bg-[#ede3ce] p-3.5 border border-[#1a1a1a]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#1a1a1a] mb-1">
                      Recipient
                    </label>
                    <input
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#fbf8f1] border border-[#1a1a1a] font-mono text-xs focus:outline-none"
                      placeholder="+8801700..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#1a1a1a] mb-1">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      value={testOtp}
                      onChange={(e) => setTestOtp(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#fbf8f1] border border-[#1a1a1a] font-mono text-xs font-bold tracking-widest focus:outline-none"
                      placeholder="4829"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#1a1a1a]">
                      API Key <span className="text-[#524d43] font-normal">(x-api-key)</span>
                    </label>
                    {apiKey && (
                      <span className="text-[10px] font-mono text-[#2e6930] font-bold">
                        ● KEY LOADED
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#fbf8f1] border border-[#1a1a1a] font-mono text-xs focus:outline-none"
                    placeholder="Enter API key or leave blank to test 401 response"
                  />
                </div>

                <Button
                  type="submit"
                  variant="dark"
                  size="sm"
                  className="w-full text-xs"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Executing Request...' : 'Send Live Request →'}
                </Button>
              </form>

              {/* Real Response Output Window */}
              <div className="bg-[#1a1a1a] p-3 font-mono text-xs border border-[#1a1a1a] overflow-x-auto">
                <div className="flex items-center justify-between border-b border-[#333333] pb-1.5 mb-2">
                  <span className="text-[#a3a3a3]">
                    {realResponse ? (
                      <span className={realResponse.status >= 200 && realResponse.status < 300 ? 'text-[#86efac]' : 'text-[#f87171]'}>
                        HTTP {realResponse.status} {realResponse.statusText}
                      </span>
                    ) : (
                      '// Live Gateway Response'
                    )}
                  </span>
                  {realResponse && (
                    <span className="text-[#fef08a] text-[10px]">
                      {realResponse.latencyMs}ms
                    </span>
                  )}
                </div>

                {realResponse ? (
                  <pre className="text-[#86efac] text-xs leading-relaxed">
                    {JSON.stringify(realResponse.data, null, 2)}
                  </pre>
                ) : (
                  <div className="text-[#737373] text-[11px] italic py-2">
                    Press &quot;Send Live Request&quot; to execute real HTTP request to {apiUrl}/send-otp
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
