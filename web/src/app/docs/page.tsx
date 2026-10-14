'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { copyToClipboard } from '@/utils/utils';

export default function DocsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'python' | 'php'>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Terminal Simulator State
  const [simPhone, setSimPhone] = useState('+8801712345678');
  const [simOtp, setSimOtp] = useState('482910');
  const [simApiKey, setSimApiKey] = useState('_ars_2k03_a9f1b8c2d3e4f5061728394a5b6c7d8e9f0123456789abcd');
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(true);
  const [simLatency, setSimLatency] = useState(132);
  const [simDate, setSimDate] = useState('Wed, 14 Oct 2026 10:18:22 GMT');
  const [simMsgId, setSimMsgId] = useState('3EB0A1F4C29D7E83B6105F');

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setHasExecuted(false);

    // Simulate realistic 300ms network & WhatsApp dispatch latency
    setTimeout(() => {
      setSimLatency(Math.floor(Math.random() * 45) + 115);
      setSimDate(new Date().toUTCString());
      // Baileys message IDs: "3EB0" + 18 uppercase hex chars.
      const hex = Array.from({ length: 18 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSimMsgId(`3EB0${hex.toUpperCase()}`);
      setIsSimulating(false);
      setHasExecuted(true);
    }, 400);
  };

  const snippets = {
    curl: `curl -X POST "${apiUrl}/send-otp" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${simApiKey || 'your_api_key_here'}" \\
  -d '{
    "phoneNumber": "${simPhone}",
    "otp": "${simOtp}"
  }'`,
    nodejs: `// Node.js (Fetch / Axios)
const response = await fetch('${apiUrl}/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${simApiKey || 'your_api_key_here'}',
  },
  body: JSON.stringify({
    phoneNumber: '${simPhone}',
    otp: '${simOtp}',
  }),
});

const result = await response.json();
console.log('Dispatch Status:', result);`,
    python: `# Python (Requests)
import requests

url = "${apiUrl}/send-otp"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${simApiKey || 'your_api_key_here'}"
}
payload = {
    "phoneNumber": "${simPhone}",
    "otp": "${simOtp}"
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`,
    php: `<?php
// PHP cURL
$ch = curl_init('${apiUrl}/send-otp');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ${simApiKey || 'your_api_key_here'}'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'phoneNumber' => '${simPhone}',
        'otp' => '${simOtp}'
    ])
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;`,
  };

  return (
    <div className="bg-[#fbf8f1] text-[#1a1a1a] pb-24">
      {/* Editorial Header */}
      <section className="border-b-2 border-[#1a1a1a] bg-[#f4efe2] px-4 py-12 md:py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <Badge variant="burgundy">DOCUMENTATION</Badge>
            <span className="font-mono text-xs text-[#524d43] font-bold">DEVELOPER GUIDE</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-[#1a1a1a] tracking-tight">
            Step-by-Step Integration Guide
          </h1>
          <p className="font-serif text-base sm:text-lg text-[#524d43] max-w-xl mx-auto">
            Everything you need to automate WhatsApp OTP verification and transactional notifications in minutes.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 space-y-16">
        {/* =========================================================
            STEP 1: CREATE ACCOUNT & GENERATE API KEY
           ========================================================= */}
        <section id="step-1" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 flex items-center justify-center font-mono font-black text-sm bg-[#1a1a1a] text-[#fbf8f1] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#7a2020]">
              01
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-[#7a2020] tracking-wider block">
                STEP 1 • ACCOUNT &amp; AUTHENTICATION
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#1a1a1a]">
                Create Account &amp; Get API Key
              </h2>
            </div>
          </div>

          <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] p-6 shadow-[5px_5px_0px_#1a1a1a] space-y-5">
            <p className="font-serif text-sm sm:text-base text-[#524d43] leading-relaxed">
              Sign up for a developer account and open your dashboard. With a single click, generate your cryptographically secure API key. Every outbound dispatch request uses this key for authorization.
            </p>

            {/* Visual Token Representation Card */}
            <div className="border-2 border-[#1a1a1a] bg-[#f4efe2] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[2px_2px_0px_#1a1a1a]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#7a2020] uppercase tracking-wider block">
                  AUTHENTICATION HEADER FORMAT
                </span>
                <code className="font-mono text-xs sm:text-sm font-bold text-[#1a1a1a] bg-[#fbf8f1] px-2 py-1 border border-[#1a1a1a] inline-block">
                  x-api-key: _ars_2k03_a9f1b8c2d3e4f506...
                </code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/register">
                  <Button variant="primary" size="sm" className="text-xs py-1.5 px-3">
                    Sign Up Free →
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="text-xs py-1.5 px-3">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            STEP 2: SCAN QR CODE (WITH DEMO QR VISUAL)
           ========================================================= */}
        <section id="step-2" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 flex items-center justify-center font-mono font-black text-sm bg-[#1a1a1a] text-[#fbf8f1] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#2e6930]">
              02
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-[#2e6930] tracking-wider block">
                STEP 2 • DEVICE PAIRING
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#1a1a1a]">
                Scan QR Code to Link WhatsApp
              </h2>
            </div>
          </div>

          <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] p-6 shadow-[5px_5px_0px_#1a1a1a] space-y-6">
            <p className="font-serif text-sm sm:text-base text-[#524d43] leading-relaxed">
              In your Dashboard under <strong>WhatsApp Device</strong>, a real-time QR code will be generated. Simply scan it with your phone using WhatsApp&apos;s Linked Devices feature.
            </p>

            {/* Split Visual: Left Demo QR Code, Right Scanning Steps */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-2 border-[#1a1a1a] bg-[#ede5d3] p-5 shadow-[3px_3px_0px_#1a1a1a]">
              {/* Left Column: Realistic Demo QR Graphic */}
              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-3">
                <div className="border-2 border-[#1a1a1a] bg-[#ffffff] p-3 shadow-[4px_4px_0px_#1a1a1a] flex flex-col items-center">
                  {/* Clean SVG Demo QR Code */}
                  <svg
                    width="150"
                    height="150"
                    viewBox="0 0 150 150"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="select-none"
                  >
                    {/* Background */}
                    <rect width="150" height="150" fill="white" />
                    {/* Top Left Marker */}
                    <rect x="10" y="10" width="40" height="40" stroke="#1a1a1a" strokeWidth="6" fill="white" />
                    <rect x="22" y="22" width="16" height="16" fill="#1a1a1a" />
                    {/* Top Right Marker */}
                    <rect x="100" y="10" width="40" height="40" stroke="#1a1a1a" strokeWidth="6" fill="white" />
                    <rect x="112" y="22" width="16" height="16" fill="#1a1a1a" />
                    {/* Bottom Left Marker */}
                    <rect x="10" y="100" width="40" height="40" stroke="#1a1a1a" strokeWidth="6" fill="white" />
                    <rect x="22" y="112" width="16" height="16" fill="#1a1a1a" />

                    {/* Stylized QR Data Blocks */}
                    <rect x="60" y="15" width="8" height="8" fill="#1a1a1a" />
                    <rect x="75" y="15" width="14" height="8" fill="#1a1a1a" />
                    <rect x="60" y="30" width="15" height="8" fill="#1a1a1a" />
                    <rect x="80" y="30" width="10" height="15" fill="#1a1a1a" />
                    <rect x="60" y="45" width="8" height="15" fill="#1a1a1a" />

                    <rect x="15" y="60" width="15" height="8" fill="#1a1a1a" />
                    <rect x="35" y="60" width="8" height="15" fill="#1a1a1a" />
                    <rect x="50" y="60" width="20" height="8" fill="#1a1a1a" />
                    <rect x="75" y="60" width="12" height="12" fill="#1a1a1a" />
                    <rect x="95" y="60" width="10" height="8" fill="#1a1a1a" />
                    <rect x="115" y="60" width="20" height="8" fill="#1a1a1a" />

                    <rect x="15" y="75" width="8" height="15" fill="#1a1a1a" />
                    <rect x="30" y="80" width="15" height="8" fill="#1a1a1a" />
                    <rect x="55" y="75" width="10" height="15" fill="#1a1a1a" />
                    <rect x="75" y="80" width="15" height="15" fill="#1a1a1a" />
                    <rect x="100" y="75" width="8" height="15" fill="#1a1a1a" />
                    <rect x="115" y="75" width="15" height="8" fill="#1a1a1a" />
                    <rect x="135" y="80" width="8" height="15" fill="#1a1a1a" />

                    <rect x="60" y="100" width="15" height="10" fill="#1a1a1a" />
                    <rect x="80" y="105" width="8" height="15" fill="#1a1a1a" />
                    <rect x="95" y="100" width="20" height="8" fill="#1a1a1a" />
                    <rect x="120" y="100" width="15" height="15" fill="#1a1a1a" />

                    <rect x="60" y="120" width="8" height="15" fill="#1a1a1a" />
                    <rect x="75" y="125" width="18" height="8" fill="#1a1a1a" />
                    <rect x="100" y="120" width="15" height="15" fill="#1a1a1a" />
                    <rect x="125" y="125" width="15" height="8" fill="#1a1a1a" />
                  </svg>
                  <span className="font-mono text-[10px] font-bold text-[#524d43] mt-2 uppercase tracking-wider">
                    Demo QR Code (Scan in App)
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#2e6930] bg-[#eaf3eb] border border-[#2e6930] px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-[#2e6930] animate-pulse" />
                  <span>SESSION: READY FOR PAIRING</span>
                </div>
              </div>

              {/* Right Column: 3 Steps to Scan */}
              <div className="md:col-span-7 space-y-3">
                <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] p-3 flex items-start gap-3">
                  <span className="font-mono font-bold text-xs bg-[#1a1a1a] text-[#fbf8f1] px-2 py-0.5 shrink-0">
                    1
                  </span>
                  <div>
                    <div className="font-mono text-xs font-bold text-[#1a1a1a]">Open WhatsApp</div>
                    <div className="font-serif text-xs text-[#524d43]">
                      On your mobile phone, open WhatsApp and go to <strong>Settings &gt; Linked Devices</strong>.
                    </div>
                  </div>
                </div>

                <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] p-3 flex items-start gap-3">
                  <span className="font-mono font-bold text-xs bg-[#1a1a1a] text-[#fbf8f1] px-2 py-0.5 shrink-0">
                    2
                  </span>
                  <div>
                    <div className="font-mono text-xs font-bold text-[#1a1a1a]">Tap &quot;Link a Device&quot;</div>
                    <div className="font-serif text-xs text-[#524d43]">
                      Point your phone camera at the QR code displayed on your screen.
                    </div>
                  </div>
                </div>

                <div className="border-2 border-[#2e6930] bg-[#eaf3eb] p-3 flex items-start gap-3">
                  <span className="font-mono font-bold text-xs bg-[#2e6930] text-[#fbf8f1] px-2 py-0.5 shrink-0">
                    ✓
                  </span>
                  <div>
                    <div className="font-mono text-xs font-bold text-[#2e6930]">Instant Pairing</div>
                    <div className="font-serif text-xs text-[#2e6930]">
                      Your device connects in &lt; 5 seconds. Sessions remain persistently active 24/7.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            STEP 3: API SPECIFICATION & CODE SNIPPETS
           ========================================================= */}
        <section id="step-3" className="space-y-6 scroll-mt-24 pt-4 border-t-2 border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 flex items-center justify-center font-mono font-black text-sm bg-[#7a2020] text-[#fbf8f1] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a]">
              03
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-[#7a2020] tracking-wider block">
                STEP 3 • REST API CALL
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#1a1a1a]">
                Dispatch Requests via REST API
              </h2>
            </div>
          </div>

          {/* Endpoint Banner */}
          <div className="border-2 border-[#1a1a1a] bg-[#ede5d3] p-4 flex flex-wrap items-center justify-between gap-3 shadow-[4px_4px_0px_#1a1a1a]">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="bg-[#2e6930] text-[#fbf8f1] px-2 py-0.5 font-bold border border-[#1a1a1a]">
                POST
              </span>
              <span className="font-black text-[#1a1a1a]">{apiUrl}/send-otp</span>
            </div>
            <Badge variant="ink">application/json</Badge>
          </div>

          {/* Parameters Table */}
          <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[4px_4px_0px_#1a1a1a] overflow-x-auto">
            <div className="bg-[#f4efe2] border-b-2 border-[#1a1a1a] px-4 py-2 font-mono text-xs font-bold text-[#1a1a1a] uppercase">
              Payload Schema
            </div>
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[#524d43]">
                  <th className="p-3">KEY</th>
                  <th className="p-3">TYPE</th>
                  <th className="p-3">REQUIRED</th>
                  <th className="p-3">EXAMPLE</th>
                  <th className="p-3">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]/20">
                <tr>
                  <td className="p-3 font-bold text-[#1a1a1a]">phoneNumber</td>
                  <td className="p-3 text-[#7a2020]">string</td>
                  <td className="p-3 font-bold text-[#7a2020]">Yes</td>
                  <td className="p-3 text-[#524d43]">+8801712345678</td>
                  <td className="p-3 text-[#524d43]">Recipient WhatsApp number. International (+8801712345678) or Bangladeshi local (01712345678) format</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#1a1a1a]">otp</td>
                  <td className="p-3 text-[#7a2020]">string</td>
                  <td className="p-3 font-bold text-[#7a2020]">Yes</td>
                  <td className="p-3 text-[#524d43]">482910</td>
                  <td className="p-3 text-[#524d43]">The verification code to send, shown with a one-tap copy button</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Error Responses Table */}
          <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[4px_4px_0px_#1a1a1a] overflow-x-auto">
            <div className="bg-[#f4efe2] border-b-2 border-[#1a1a1a] px-4 py-2 font-mono text-xs font-bold text-[#1a1a1a] uppercase">
              Error Responses
            </div>
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[#524d43]">
                  <th className="p-3">STATUS</th>
                  <th className="p-3">WHEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]/20">
                {[
                  ['400', 'phoneNumber or otp is missing, the number format is invalid, or the number is not registered on WhatsApp'],
                  ['401', 'x-api-key header is missing, or the key is invalid or revoked'],
                  ['503', 'Your WhatsApp device is not connected. Link it from the dashboard first'],
                ].map(([status, when]) => (
                  <tr key={status}>
                    <td className="p-3 font-bold text-[#7a2020]">{status}</td>
                    <td className="p-3 text-[#524d43]">{when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <pre className="border-t border-[#1a1a1a] bg-[#f4efe2] p-3 font-mono text-xs text-[#1a1a1a] overflow-x-auto">
{`{
  "statusCode": 503,
  "message": "WhatsApp device is not connected. Please connect your device in the WhatsApp Device tab first.",
  "error": "Service Unavailable"
}`}
            </pre>
          </div>

          {/* Multi-Language Code Snippets */}
          <div className="border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a]">
            {/* Language Selector Bar */}
            <div className="border-b-2 border-[#333333] bg-[#222222] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                {(['curl', 'nodejs', 'python', 'php'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer ${
                      activeTab === lang
                        ? 'bg-[#fbf8f1] text-[#1a1a1a] border-[#fbf8f1] shadow-[2px_2px_0px_#7a2020]'
                        : 'bg-transparent text-[#d4d4d4] border-transparent hover:border-[#524d43]'
                    }`}
                  >
                    {lang === 'curl'
                      ? 'cURL'
                      : lang === 'nodejs'
                      ? 'Node.js'
                      : lang === 'python'
                      ? 'Python'
                      : 'PHP'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopy(snippets[activeTab], 'snippet_' + activeTab)}
                className="font-mono text-xs bg-[#fbf8f1] text-[#1a1a1a] px-3 py-1 font-bold hover:bg-[#ede5d3] cursor-pointer"
              >
                {copiedKey === 'snippet_' + activeTab ? '✓ COPIED' : 'COPY CODE'}
              </button>
            </div>

            {/* Code Box */}
            <div className="p-5 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed text-[#fbf8f1] max-h-[300px]">
              <pre>
                <code>{snippets[activeTab]}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* =========================================================
            STEP 4: LIVE TERMINAL SIMULATOR (Realtime Live Demo)
           ========================================================= */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">INTERACTIVE SIMULATION</Badge>
            <span className="font-mono text-xs text-[#524d43] font-bold">REALTIME RUNNER</span>
          </div>

          <div className="border-2 border-[#1a1a1a] bg-[#f4efe2] p-6 shadow-[6px_6px_0px_#1a1a1a] space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-black text-[#1a1a1a]">
                Live Terminal Preview
              </h3>
              <p className="font-serif text-sm text-[#524d43] mt-1">
                Test the parameters below and run the simulated terminal to see the live dispatch flow and expected JSON response.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleRunSimulation} className="space-y-4 bg-[#ede5d3] p-4 border-2 border-[#1a1a1a]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#1a1a1a] mb-1">
                    DEMO PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full bg-[#fbf8f1] border border-[#1a1a1a] px-3 py-1.5 font-mono text-xs text-[#1a1a1a] focus:outline-none"
                    placeholder="+8801712345678"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#1a1a1a] mb-1">
                    DEMO OTP CODE
                  </label>
                  <input
                    type="text"
                    value={simOtp}
                    onChange={(e) => setSimOtp(e.target.value)}
                    className="w-full bg-[#fbf8f1] border border-[#1a1a1a] px-3 py-1.5 font-mono text-xs text-[#1a1a1a] focus:outline-none"
                    placeholder="482910"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#1a1a1a] mb-1">
                    API KEY (x-api-key)
                  </label>
                  <input
                    type="text"
                    value={simApiKey}
                    onChange={(e) => setSimApiKey(e.target.value)}
                    className="w-full bg-[#fbf8f1] border border-[#1a1a1a] px-3 py-1.5 font-mono text-xs text-[#1a1a1a] focus:outline-none"
                    placeholder="_ars_2k03_..."
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSimulating}
                  className="font-mono text-xs tracking-wider shadow-[3px_3px_0px_#1a1a1a]"
                >
                  {isSimulating ? 'EXECUTING IN TERMINAL...' : '▶ RUN TERMINAL TEST'}
                </Button>
                <span className="font-mono text-[11px] text-[#524d43] hidden sm:inline">
                  Simulates realistic WebSocket queue &amp; dispatch
                </span>
              </div>
            </form>

            {/* Live Terminal Output Window */}
            <div className="border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] shadow-[4px_4px_0px_#1a1a1a] overflow-hidden">
              {/* Terminal Window Chrome */}
              <div className="border-b border-[#333333] bg-[#222222] px-4 py-2 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  <span className="text-[#a3a3a3] ml-2 font-bold">bash ~ terminal</span>
                </div>
                {hasExecuted && (
                  <div className="flex items-center gap-2">
                    <span className="bg-[#2e6930] text-[#fbf8f1] px-1.5 py-0.5 text-[10px] font-bold">
                      HTTP 200 OK
                    </span>
                    <span className="text-[#fef08a] text-[11px]">{simLatency}ms</span>
                  </div>
                )}
              </div>

              {/* Terminal Execution Body */}
              <div className="p-4 font-mono text-xs leading-relaxed space-y-3">
                <div className="text-[#86efac]">
                  <span className="text-[#a3a3a3]">$ </span>
                  curl -X POST &quot;{apiUrl}/send-otp&quot; -H &quot;x-api-key: {simApiKey}&quot; -d &apos;{`{"phoneNumber":"${simPhone}","otp":"${simOtp}"}`}&apos;
                </div>

                {isSimulating ? (
                  <div className="text-[#fef08a] animate-pulse py-4">
                    [INFO] Handshaking with Baileys socket session...
                    <br />
                    [INFO] Encrypting and dispatching verification packet to WhatsApp server...
                  </div>
                ) : hasExecuted ? (
                  <div className="space-y-2">
                    <div className="text-[#93c5fd]">
                      HTTP/1.1 200 OK
                      <br />
                      Content-Type: application/json; charset=utf-8
                      <br />
                      Date: {simDate}
                    </div>
                    <pre className="text-[#86efac] bg-[#111111] p-3 border border-[#333333] overflow-x-auto">
{JSON.stringify(
  {
    statusCode: 200,
    success: true,
    message: 'OTP sent successfully',
    data: {
      messageId: simMsgId,
      recipientJid: `${simPhone.replace(/\D/g, '').replace(/^0/, '880')}@s.whatsapp.net`,
    },
  },
  null,
  2
)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Card */}
        <div className="border-2 border-[#1a1a1a] bg-[#ede5d3] p-8 text-center space-y-4 shadow-[4px_4px_0px_#1a1a1a]">
          <h3 className="font-serif text-2xl font-black text-[#1a1a1a]">
            Ready to integrate with your backend?
          </h3>
          <p className="font-serif text-sm text-[#524d43] max-w-md mx-auto">
            Create your account now, link your WhatsApp account, and start sending messages instantly.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button variant="primary" size="lg" className="shadow-[3px_3px_0px_#1a1a1a]">
                Get Started Free →
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
