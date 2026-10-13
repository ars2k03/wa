'use client';

import React, { useState } from 'react';
import { copyToClipboard } from '@/utils/utils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function DeveloperDocsTab() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

  const curlExample = `curl -X POST "${apiUrl}/send-otp" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your_api_key_here" \\
  -d '{
    "phoneNumber": "+8801700000000",
    "otp": "940214",
    "sessionId": "default"
  }'`;

  return (
    <div className="space-y-8">
      {/* Intro Card */}
      <Card
        title="DEVELOPER SPECIFICATIONS & WIRE REFERENCE"
        subtitle="COMPLETE TELEGRAPHIC REST PROTOCOL MANUAL"
        variant="tint"
      >
        <p className="font-serif text-sm text-[#524d43] leading-relaxed">
          The WhatsApp OTP Gateway exposes a minimalist, high-speed RESTful API running on port <span className="font-mono font-bold text-[#1a1a1a]">3002</span>. Every request is verified against the database and dispatches messages over native WebSockets to the WhatsApp network.
        </p>
      </Card>

      {/* Main Endpoints Section */}
      <div className="space-y-6">
        {/* Endpoint 1: Send OTP */}
        <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a]">
          <div className="border-b-2 border-[#1a1a1a] px-4 py-3 bg-[#ede5d3] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black bg-[#2e6930] text-[#fbf8f1] px-2 py-0.5 border border-[#1a1a1a]">
                POST
              </span>
              <span className="font-mono text-sm font-bold text-[#1a1a1a]">
                /send-otp
              </span>
            </div>
            <span className="font-mono text-xs text-[#524d43]">
              CORE DISPATCH OPERATION
            </span>
          </div>

          <div className="p-6 space-y-4">
            <p className="font-serif text-sm text-[#1a1a1a]">
              Dispatches an OTP verification code or notification message directly to a target WhatsApp telephone number.
            </p>

            <div className="space-y-2">
              <div className="font-mono text-xs font-bold uppercase text-[#1a1a1a]">
                REQUIRED HEADERS:
              </div>
              <div className="bg-[#f4efe2] border border-[#1a1a1a] p-3 font-mono text-xs space-y-1">
                <div>Content-Type: application/json</div>
                <div>x-api-key: _ars_2k03_&lt;your_48_hex_key&gt;</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs font-bold uppercase text-[#1a1a1a]">
                REQUEST BODY JSON:
              </div>
              <pre className="bg-[#1a1a1a] text-[#fbf8f1] border border-[#1a1a1a] p-3 font-mono text-xs overflow-x-auto">
                {`{
  "phoneNumber": "+8801700000000",   // Target phone number with country code
  "otp": "940214",                   // 4-8 digit numeric or alphanumeric code
  "sessionId": "default"             // Optional, defaults to key's linked session
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-mono text-xs font-bold uppercase text-[#1a1a1a]">
                  CURL WIRE COMMAND:
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy('curl-otp', curlExample)}
                  className="text-xs py-0.5 px-2"
                >
                  {copiedId === 'curl-otp' ? '✓ COPIED' : 'COPY CURL'}
                </Button>
              </div>
              <pre className="bg-[#1a1a1a] text-[#84cc16] border border-[#1a1a1a] p-3 font-mono text-xs overflow-x-auto">
                <code>{curlExample}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs font-bold uppercase text-[#1a1a1a]">
                SUCCESSFUL RESPONSE (200 OK):
              </div>
              <pre className="bg-[#f4efe2] border border-[#1a1a1a] p-3 font-mono text-xs text-[#1a1a1a] overflow-x-auto">
                {`{
  "statusCode": 200,
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "messageId": "3EB048...A92",
    "recipient": "8801700000000@s.whatsapp.net",
    "timestamp": 1728812900000
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Endpoint 2: Session Operations */}
        <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a]">
          <div className="border-b-2 border-[#1a1a1a] px-4 py-3 bg-[#ede5d3]">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
              SESSION LIFECYCLE ENDPOINTS
            </span>
          </div>

          <div className="p-6 divide-y divide-[#1a1a1a] space-y-4 text-xs font-mono">
            <div className="pt-2">
              <div className="font-bold text-sm text-[#1a1a1a]">
                POST /sessions/:sessionId/init
              </div>
              <p className="font-serif text-sm text-[#524d43] mt-1">
                Initializes Baileys socket for the specified session and generates high-contrast QR code data URL.
              </p>
            </div>

            <div className="pt-4">
              <div className="font-bold text-sm text-[#1a1a1a]">
                GET /sessions/:sessionId/status
              </div>
              <p className="font-serif text-sm text-[#524d43] mt-1">
                Returns the current session status (&apos;connecting&apos;, &apos;connected&apos;, &apos;qr_ready&apos;, &apos;disconnected&apos;) along with Base64 QR image string.
              </p>
            </div>

            <div className="pt-4">
              <div className="font-bold text-sm text-[#1a1a1a]">
                POST /sessions/:sessionId/pairing-code
              </div>
              <p className="font-serif text-sm text-[#524d43] mt-1">
                Generates an 8-character telephone pairing code for users unable to scan with camera.
              </p>
            </div>

            <div className="pt-4">
              <div className="font-bold text-sm text-[#7a2020]">
                DELETE /sessions/:sessionId
              </div>
              <p className="font-serif text-sm text-[#524d43] mt-1">
                Disconnects and clears authentication session credentials from Redis cache.
              </p>
            </div>
          </div>
        </div>

        {/* HTTP Error Status Reference */}
        <div className="border-3 border-[#1a1a1a] bg-[#ede5d3] p-6 shadow-[6px_6px_0px_#1a1a1a]">
          <h4 className="font-serif font-black text-lg text-[#1a1a1a] uppercase mb-3">
            STANDARD HTTP ERROR CODES
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#fbf8f1] border border-[#1a1a1a] p-3 space-y-1">
              <div className="font-bold text-[#7a2020]">401 UNAUTHORIZED</div>
              <div className="text-[#524d43]">Missing or invalid x-api-key header. Check that your key is active in the console.</div>
            </div>
            <div className="bg-[#fbf8f1] border border-[#1a1a1a] p-3 space-y-1">
              <div className="font-bold text-[#b45309]">503 SERVICE UNAVAILABLE</div>
              <div className="text-[#524d43]">Target WhatsApp session is not connected or QR has not yet been scanned.</div>
            </div>
            <div className="bg-[#fbf8f1] border border-[#1a1a1a] p-3 space-y-1">
              <div className="font-bold text-[#1a1a1a]">400 BAD REQUEST</div>
              <div className="text-[#524d43]">Malformed payload or missing required parameter (phoneNumber or otp).</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
