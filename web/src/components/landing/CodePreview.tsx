'use client';

import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';
import { Button } from '../ui/Button';

const SNIPPETS: Record<string, { label: string; code: string }> = {
  curl: {
    label: 'cURL',
    code: `curl -X POST "http://localhost:3002/send-otp" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: _ars_2k03_your_secret_key" \\
  -d '{
    "phoneNumber": "+8801700000000",
    "otp": "492018",
    "sessionId": "default"
  }'`,
  },
  nodejs: {
    label: 'Node.js (Fetch)',
    code: `const response = await fetch('http://localhost:3002/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '_ars_2k03_your_secret_key',
  },
  body: JSON.stringify({
    phoneNumber: '+8801700000000',
    otp: '492018',
    sessionId: 'default',
  }),
});

const result = await response.json();
console.log('Dispatch status:', result.success, result.data.messageId);`,
  },
  python: {
    label: 'Python (Requests)',
    code: `import requests

url = "http://localhost:3002/send-otp"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "_ars_2k03_your_secret_key"
}
payload = {
    "phoneNumber": "+8801700000000",
    "otp": "492018",
    "sessionId": "default"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
  },
  php: {
    label: 'PHP (cURL)',
    code: `<?php
$ch = curl_init('http://localhost:3002/send-otp');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: _ars_2k03_your_secret_key'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'phoneNumber' => '+8801700000000',
        'otp' => '492018',
        'sessionId' => 'default'
    ])
]);
$response = curl_exec($ch);
curl_close($ch);
echo $response;`,
  },
  go: {
    label: 'Go',
    code: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	payload, _ := json.Marshal(map[string]string{
		"phoneNumber": "+8801700000000",
		"otp":         "492018",
		"sessionId":   "default",
	})

	req, _ := http.NewRequest("POST", "http://localhost:3002/send-otp", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", "_ars_2k03_your_secret_key")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("Status:", resp.Status)
}`,
  },
};

export function CodePreview() {
  const [activeTab, setActiveTab] = useState<string>('curl');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(SNIPPETS[activeTab].code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="border-b-3 border-[#1a1a1a] bg-[#ede5d3] px-4 py-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="font-mono text-xs font-bold text-[#7a2020] uppercase tracking-widest">
            SECTION IV: CODE SCHEMATICS & WIRE PROTOCOL
          </div>
          <h3 className="font-serif text-3xl sm:text-5xl font-black text-[#1a1a1a] uppercase tracking-tight">
            INTEGRATE IN ANY LANGUAGE
          </h3>
          <p className="font-serif text-sm sm:text-base text-[#524d43]">
            Standardized HTTP JSON interface. Plug into your registration flow, checkout verify, or password reset routine.
          </p>
        </div>

        <div className="max-w-4xl mx-auto border-3 border-[#1a1a1a] bg-[#1a1a1a] text-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a]">
          {/* Tab Selection Bar */}
          <div className="border-b-2 border-[#333333] bg-[#222222] px-4 py-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              {Object.entries(SNIPPETS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    activeTab === key
                      ? 'bg-[#fbf8f1] text-[#1a1a1a] border-[#fbf8f1] shadow-[2px_2px_0px_#7a2020]'
                      : 'bg-transparent text-[#d4d4d4] border-transparent hover:border-[#524d43]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="text-xs py-1 px-3 bg-[#fbf8f1] text-[#1a1a1a]"
            >
              {copied ? '✓ COPIED TO CLIPBOARD' : 'COPY SNIPPET'}
            </Button>
          </div>

          {/* Code Window */}
          <div className="p-5 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed text-[#fbf8f1]">
            <pre>
              <code>{SNIPPETS[activeTab].code}</code>
            </pre>
          </div>

          {/* Technical Note in Footer */}
          <div className="border-t border-[#333333] px-4 py-2 bg-[#171717] font-mono text-[11px] text-[#a3a3a3] flex items-center justify-between">
            <span>ENDPOINT: /send-otp (PORT 3002)</span>
            <span>SPEC: JSON OVER HTTP/1.1</span>
          </div>
        </div>
      </div>
    </section>
  );
}
