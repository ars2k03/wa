'use client';

import React from 'react';
import Link from 'next/link';
import {
  Callout,
  CodePanel,
  DocsSection,
  DocsTable,
  Eyebrow,
  InlineCode,
  ParamList,
  Prose,
  Split,
  SubHeading,
} from '@/components/docs/DocsUI';

const EXAMPLE_PHONE = '+8801712345678';
const EXAMPLE_OTP = '482910';
const EXAMPLE_KEY_SHORT = '_ars_2k03_a9f1b8c2d3e4f506...';

function requestSnippets(apiUrl: string) {
  const url = `${apiUrl}/send-otp`;
  return [
    {
      id: 'curl',
      label: 'cURL',
      code: `curl -X POST "${url}" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"phoneNumber": "${EXAMPLE_PHONE}", "otp": "${EXAMPLE_OTP}"}'`,
    },
    {
      id: 'node',
      label: 'Node.js',
      code: `const res = await fetch("${url}", {
  method: "POST",
  headers: {
    "x-api-key": process.env.WA_GATEWAY_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ phoneNumber: "${EXAMPLE_PHONE}", otp: "${EXAMPLE_OTP}" }),
});

const result = await res.json();
if (!res.ok) throw new Error(result.message);
console.log(result.data.messageId);`,
    },
    {
      id: 'python',
      label: 'Python',
      code: `import os, requests

res = requests.post(
    "${url}",
    headers={"x-api-key": os.environ["WA_GATEWAY_KEY"]},
    json={"phoneNumber": "${EXAMPLE_PHONE}", "otp": "${EXAMPLE_OTP}"},
)

res.raise_for_status()
print(res.json()["data"]["messageId"])`,
    },
    {
      id: 'php',
      label: 'PHP',
      code: `<?php
$ch = curl_init("${url}");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "x-api-key: " . getenv("WA_GATEWAY_KEY"),
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "phoneNumber" => "${EXAMPLE_PHONE}",
        "otp" => "${EXAMPLE_OTP}",
    ]),
]);
$result = json_decode(curl_exec($ch), true);
echo $result["data"]["messageId"];`,
    },
  ];
}

const json = (value: unknown) => JSON.stringify(value, null, 2);

// These mirror the backend's real responses (backend/src/whatsapp/whatsapp.controller.ts).
const SUCCESS_RESPONSE = json({
  statusCode: 200,
  success: true,
  message: 'OTP sent successfully',
  data: {
    messageId: '3EB0A1F4C29D7E83B6105F',
    recipientJid: '8801712345678@s.whatsapp.net',
  },
});

const NOT_ON_WHATSAPP_RESPONSE = json({
  statusCode: 400,
  message: 'Number 8801712345678 is not registered on WhatsApp.',
  error: 'Bad Request',
});

const NOT_CONNECTED_RESPONSE = json({
  statusCode: 503,
  message: 'WhatsApp device is not connected. Please connect your device in the WhatsApp Device tab first.',
  error: 'Service Unavailable',
});

const QUICKSTART_STEPS = [
  { title: 'Create an account', body: <>Sign up and verify your email.</> },
  {
    title: 'Link WhatsApp',
    body: (
      <>
        Dashboard → <strong>WhatsApp Device</strong>. Scan the QR code from WhatsApp → Linked Devices.
      </>
    ),
  },
  {
    title: 'Create an API key',
    body: (
      <>
        Dashboard → <strong>API Keys</strong> → Generate. Copy it somewhere safe.
      </>
    ),
  },
  {
    title: 'Send an OTP',
    body: (
      <>
        Call <InlineCode>POST /send-otp</InlineCode> with the number and code.
      </>
    ),
  },
];

export default function DocsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

  return (
    <main className="min-w-0 px-4 sm:px-8 lg:px-12 pt-10 pb-24">
        {/* Introduction */}
        <section id="introduction" className="scroll-mt-24 pb-12 mb-12 border-b-2 border-dashed border-[#d6cdb8]">
          <Eyebrow>Documentation</Eyebrow>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#1a1a1a] leading-[1.1] tracking-tight mt-2 mb-3">
            Send WhatsApp OTPs with one API call
          </h1>
          <Prose className="text-lg">
            WA Gateway sends verification codes from <strong>your own WhatsApp number</strong> to your users. Link
            your phone once, create an API key, and send codes with a single HTTP request.
          </Prose>

          <div className="mt-5 border-2 border-[#1a1a1a] bg-[#ede5d3] shadow-[4px_4px_0px_#1a1a1a] px-3.5 py-3 flex flex-wrap items-center gap-2.5 font-mono">
            <span className="text-[10px] font-bold tracking-[0.1em] text-[#524d43]">BASE URL</span>
            <code className="text-[13px] font-bold break-all">{apiUrl}</code>
          </div>

          <Callout tone="tip" title="ONE ACCOUNT = ONE WHATSAPP">
            Every account links exactly one WhatsApp number. All messages sent with your API keys come from that
            number.
          </Callout>
        </section>

        {/* Quickstart */}
        <DocsSection id="quickstart" eyebrow="Getting started" title="Quickstart">
          <Prose>Go from zero to your first OTP in about two minutes.</Prose>
          <ol className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3 mt-5">
            {QUICKSTART_STEPS.map((step, i) => (
              <li key={step.title} className="border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[4px_4px_0px_#1a1a1a] p-4">
                <span className="inline-flex w-7 h-7 items-center justify-center bg-[#1a1a1a] text-[#fbf8f1] font-mono text-xs font-extrabold mb-2.5">
                  {i + 1}
                </span>
                <div className="font-mono text-[13px] font-extrabold mb-1">{step.title}</div>
                <p className="font-serif text-sm text-[#524d43] leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
          <Callout title="TEST WITHOUT CODE">
            Dashboard → <strong>Message Tester</strong> sends a real OTP to any number, so you can see the full flow
            before integrating.
          </Callout>
        </DocsSection>

        {/* Authentication */}
        <DocsSection id="authentication" eyebrow="Basics" title="Authentication">
          <Split
            aside={
              <CodePanel
                label="HEADERS"
                tabs={[
                  {
                    id: 'headers',
                    label: 'Headers',
                    code: `x-api-key: ${EXAMPLE_KEY_SHORT}\n\n# or\nAuthorization: Bearer ${EXAMPLE_KEY_SHORT}`,
                  },
                ]}
              />
            }
          >
            <Prose>
              Every request needs your API key. Send it in the <InlineCode>x-api-key</InlineCode> header. The{' '}
              <InlineCode>Authorization: Bearer</InlineCode> header also works.
            </Prose>
            <Prose>
              Keys look like <InlineCode>_ars_2k03_</InlineCode> followed by 48 characters.
            </Prose>
            <Callout tone="warn" title="KEEP KEYS SECRET">
              Call the API from your server only. Never put your key in browser or mobile app code. If a key leaks,
              delete it in the dashboard and create a new one.
            </Callout>
          </Split>
        </DocsSection>

        {/* Phone number format */}
        <DocsSection id="phone-format" eyebrow="Basics" title="Phone number format">
          <Prose>
            Send the number with its country code. Spaces, dashes and <InlineCode>+</InlineCode> are removed for you.
            Bangladeshi local numbers starting with <InlineCode>0</InlineCode> are converted automatically.
          </Prose>
          <DocsTable
            head={['YOU SEND', 'WE SEND TO', 'RESULT']}
            rows={[
              ['+8801712345678', <InlineCode key="a">8801712345678</InlineCode>, '✓ Works'],
              ['01712345678', <InlineCode key="b">8801712345678</InlineCode>, '✓ Works (local BD format)'],
              ['+880 1712-345678', <InlineCode key="c">8801712345678</InlineCode>, '✓ Works'],
              ['12345', '—', '✗ 400: too short (needs 10–15 digits)'],
            ]}
          />
        </DocsSection>

        {/* Send OTP */}
        <DocsSection id="send-otp" eyebrow="API reference" title="Send an OTP">
          <Split
            aside={
              <>
                <CodePanel tabs={requestSnippets(apiUrl)} />
                <CodePanel
                  label="RESPONSE"
                  status={{ text: '200 OK', ok: true }}
                  json
                  tabs={[{ id: 'res', label: 'Response', code: SUCCESS_RESPONSE }]}
                />
              </>
            }
          >
            <div className="inline-flex items-center gap-2 font-mono text-sm font-extrabold border-2 border-[#1a1a1a] bg-[#ede5d3] shadow-[3px_3px_0px_#1a1a1a] px-2.5 py-1.5 mb-4">
              <span className="text-[11px] bg-[#2e6930] text-[#fbf8f1] px-1.5 py-0.5">POST</span>
              /send-otp
            </div>
            <Prose>
              Sends a verification code to a WhatsApp number. The user gets a message with the code and a one-tap{' '}
              <strong>Copy Code</strong> button.
            </Prose>

            <SubHeading>Body parameters</SubHeading>
            <ParamList
              params={[
                {
                  name: 'phoneNumber',
                  type: 'string',
                  required: true,
                  children: (
                    <>
                      The recipient&apos;s WhatsApp number. See{' '}
                      <a href="#phone-format" className="underline">
                        phone number format
                      </a>
                      .
                    </>
                  ),
                },
                {
                  name: 'otp',
                  type: 'string',
                  required: true,
                  children: (
                    <>The code to send. You generate it and check it in your own app; WA Gateway only delivers it.</>
                  ),
                },
              ]}
            />

            <SubHeading>Response fields</SubHeading>
            <ParamList
              params={[
                {
                  name: 'success',
                  type: 'boolean',
                  children: (
                    <>
                      <InlineCode>true</InlineCode> when WhatsApp accepted the message.
                    </>
                  ),
                },
                {
                  name: 'message',
                  type: 'string',
                  children: (
                    <>
                      Always <InlineCode>&quot;OTP sent successfully&quot;</InlineCode> on success.
                    </>
                  ),
                },
                {
                  name: 'data.messageId',
                  type: 'string',
                  children: (
                    <>
                      WhatsApp&apos;s ID for this message. It also appears in your dashboard&apos;s{' '}
                      <strong>Message Logs</strong>, so you can match it later.
                    </>
                  ),
                },
                {
                  name: 'data.recipientJid',
                  type: 'string',
                  children: (
                    <>
                      The WhatsApp address the code went to, e.g. <InlineCode>8801712345678@s.whatsapp.net</InlineCode>.
                      Use it to confirm which number was used after formatting.
                    </>
                  ),
                },
              ]}
            />
          </Split>
        </DocsSection>

        {/* Errors */}
        <DocsSection id="errors" eyebrow="Reference" title="Errors">
          <Split
            aside={
              <>
                <CodePanel
                  label="RESPONSE"
                  status={{ text: '400 BAD REQUEST', ok: false }}
                  json
                  tabs={[{ id: '400', label: '400', code: NOT_ON_WHATSAPP_RESPONSE }]}
                />
                <CodePanel
                  label="RESPONSE"
                  status={{ text: '503 SERVICE UNAVAILABLE', ok: false }}
                  json
                  tabs={[{ id: '503', label: '503', code: NOT_CONNECTED_RESPONSE }]}
                />
              </>
            }
          >
            <Prose>
              Failed requests return a non-2xx status and a JSON body with a readable <InlineCode>message</InlineCode>.
              Show or log that message; it tells you what to fix.
            </Prose>
            <DocsTable
              head={['STATUS', 'WHAT HAPPENED', 'HOW TO FIX']}
              rows={[
                [
                  '400',
                  <span key="a">
                    <InlineCode>phoneNumber</InlineCode> or <InlineCode>otp</InlineCode> missing
                  </span>,
                  'Send both fields as strings.',
                ],
                ['400', 'Invalid phone number', 'Use 10–15 digits with country code.'],
                ['400', 'Number not on WhatsApp', 'Ask the user for a number that uses WhatsApp.'],
                [
                  '401',
                  'Missing, invalid or revoked API key',
                  <span key="b">
                    Check the <InlineCode>x-api-key</InlineCode> header and that the key still exists.
                  </span>,
                ],
                ['503', 'Your WhatsApp is not linked', 'Dashboard → WhatsApp Device → scan the QR again.'],
              ]}
            />
          </Split>
        </DocsSection>

        {/* Message preview */}
        <DocsSection id="message-preview" eyebrow="Reference" title="What your users receive">
          <Split
            aside={
              <div className="bg-[#efeae2] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] p-5 max-w-sm">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden font-sans">
                  <div className="px-3 pt-2.5 pb-1 text-[14.5px] text-[#111111] leading-snug">
                    <strong>{EXAMPLE_OTP}</strong> is your verification code.
                    <br />
                    <br />
                    For your security, do not share this code.
                  </div>
                  <div className="px-3 pb-2 flex justify-between gap-2 text-[12.5px] text-[#667781]">
                    <span>This code expires in 5 minutes</span>
                    <span>10:18</span>
                  </div>
                  <div className="border-t border-[#e9edef] text-center py-2.5 text-[14.5px] font-medium text-[#027eb5]">
                    ⧉ Copy Code
                  </div>
                </div>
              </div>
            }
          >
            <Prose>
              The message comes from your linked WhatsApp number. The code is shown in bold, and the{' '}
              <strong>Copy Code</strong> button copies it in one tap.
            </Prose>
            <Callout tone="warn" title='ABOUT "EXPIRES IN 5 MINUTES"'>
              This footer text is fixed. WA Gateway does not expire codes; your app decides how long a code stays
              valid.
            </Callout>
          </Split>
        </DocsSection>

        {/* Next steps */}
        <section>
          <h2 className="font-serif text-[28px] font-black text-[#1a1a1a] mb-4">Next steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Open the dashboard →', body: 'Link WhatsApp and create your first key.' },
              { title: 'Try the Message Tester →', body: 'Send a real OTP without writing code.' },
            ].map((card) => (
              <Link
                key={card.title}
                href="/dashboard"
                className="block border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[4px_4px_0px_#1a1a1a] p-4 hover:bg-[#f4efe2] transition-colors"
              >
                <div className="font-mono text-[13px] font-extrabold">{card.title}</div>
                <p className="font-serif text-sm text-[#524d43] mt-1">{card.body}</p>
              </Link>
            ))}
          </div>
        </section>
    </main>
  );
}
