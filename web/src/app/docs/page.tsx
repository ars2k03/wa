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
  Step,
  Steps,
  SubHeading,
} from '@/components/docs/DocsUI';
import { Marker, WhatsAppPreview } from '@/components/docs/WhatsAppPreview';
import { CustomTemplateExample } from '@/components/docs/CustomTemplateExample';
import {
  AUTH_SNIPPETS,
  ENV_SNIPPET,
  ERROR_EXAMPLES,
  EXAMPLE_OTP,
  SUCCESS_RESPONSE,
  errorHandlingSnippets,
  sendOtpSnippets,
  verifyFlowSnippets,
} from '@/utils/snippets';

const FLOW = [
  { title: 'Your server', body: 'Generates a code and calls POST /send-otp' },
  { title: 'WA Gateway', body: 'Checks your API key and formats the number' },
  { title: 'Your WhatsApp', body: 'Your linked phone sends the message' },
  { title: "User's phone", body: 'Receives the code with a Copy Code button' },
];

const FAQ = [
  {
    q: 'Can I change the message text?',
    a: 'Yes. In the dashboard under Custom Template you can write your own message with {{code}} where the code goes, change or remove the footer, and choose whether to show the Copy Code button. Without a custom template, the default message is sent.',
  },
  {
    q: 'Can I send to numbers outside Bangladesh?',
    a: 'Yes. Send the number with its country code, for example +14155550123. Any number registered on WhatsApp works.',
  },
  {
    q: 'Can I link more than one WhatsApp number?',
    a: 'No. One account links exactly one WhatsApp number, and every API key on the account sends from it. Use a separate account for a second number.',
  },
  {
    q: 'Does WA Gateway check if the code the user typed is correct?',
    a: 'No. WA Gateway only delivers the code. Your app creates it, stores it and checks it. See "Verify OTP codes" for a complete example.',
  },
  {
    q: 'Is there a test mode?',
    a: 'No. Every request sends a real WhatsApp message. Use your own number while testing, or the Message Tester in the dashboard.',
  },
  {
    q: 'Can I call the API from my website or mobile app directly?',
    a: 'No. Browsers are blocked by CORS, and putting your key in client code would let anyone send messages from your number. Always call it from your server.',
  },
];

export default function DocsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  const sendOtp = sendOtpSnippets(apiUrl);

  return (
    <main className="min-w-0 px-4 sm:px-8 lg:px-12 pt-10 pb-24">
      {/* ================================================================ Introduction */}
      <section id="introduction" className="scroll-mt-24 pb-12 mb-12 border-b-2 border-dashed border-[#d6cdb8]">
        <Split
          aside={
            <>
              <CodePanel title="POST /send-otp" tabs={sendOtp} syncLanguage />
              <CodePanel title="Response" status={{ text: '200 OK', ok: true }} kind="json" tabs={[{ id: 'res', label: 'JSON', code: SUCCESS_RESPONSE }]} />
            </>
          }
        >
          <Eyebrow>Documentation</Eyebrow>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#1a1a1a] leading-[1.1] tracking-tight mt-2 mb-4">
            Send WhatsApp OTPs with one API call
          </h1>
          <Prose className="text-lg">
            WA Gateway sends verification codes from <strong>your own WhatsApp number</strong> to your users. Link
            your phone once, create an API key, and send a code with a single HTTP request.
          </Prose>

          <div className="mt-6 border-2 border-[#1a1a1a] bg-[#ede5d3] shadow-[4px_4px_0px_#1a1a1a] px-3.5 py-3 flex flex-wrap items-center gap-2.5 font-mono max-w-[70ch]">
            <span className="text-[10px] font-bold tracking-[0.1em] text-[#524d43]">BASE URL</span>
            <code className="text-[13px] font-bold break-all">{apiUrl}</code>
          </div>

          <ul className="mt-6 grid gap-3 max-w-[70ch]">
            {[
              ['One endpoint', 'POST /send-otp is all you need. No WhatsApp template approval, no review process.'],
              ['Your own number', 'Messages come from the WhatsApp number you link, not an unknown sender.'],
              ['Your own message', 'Use the default message or write your own, with or without a one-tap Copy Code button.'],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-3 font-serif text-[#524d43]">
                <span className="mt-1.5 w-2 h-2 shrink-0 bg-[#7a2020]" />
                <span>
                  <strong className="text-[#1a1a1a]">{title}.</strong> {body}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 mt-7">
            <a
              href="#quickstart"
              className="font-mono text-xs font-extrabold border-2 border-[#1a1a1a] bg-[#7a2020] text-[#fbf8f1] px-4 py-2.5 shadow-[3px_3px_0px_#1a1a1a] hover:bg-[#5e1818]"
            >
              Start the quickstart →
            </a>
            <a
              href="#send-otp"
              className="font-mono text-xs font-extrabold border-2 border-[#1a1a1a] bg-[#fbf8f1] px-4 py-2.5 hover:bg-[#f4efe2]"
            >
              API reference
            </a>
          </div>
        </Split>
      </section>

      {/* ================================================================ How it works */}
      <DocsSection id="how-it-works" eyebrow="Getting started" title="How it works">
        <Prose>
          When you link your phone, WA Gateway becomes one of its <strong>Linked Devices</strong>, just like WhatsApp
          Web. Each OTP you send goes out from that number.
        </Prose>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-0 mt-6">
          {FLOW.map((step, i) => (
            <li key={step.title} className="relative flex md:block items-stretch">
              <div className="flex-1 border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[4px_4px_0px_#1a1a1a] p-4 md:mr-8 h-full">
                <div className="font-mono text-[10px] font-extrabold text-[#7a2020] tracking-[0.1em]">STEP {i + 1}</div>
                <div className="font-mono text-[13px] font-extrabold mt-1">{step.title}</div>
                <p className="font-serif text-sm text-[#524d43] mt-1 leading-snug">{step.body}</p>
              </div>
              {i < FLOW.length - 1 && (
                <span
                  aria-hidden
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-8 justify-center font-mono font-black text-[#7a2020]"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <Callout tone="tip" title="YOUR APP OWNS THE CODE">
          WA Gateway delivers the code but never stores or checks it. Your app generates the code, saves it, and
          verifies what the user types. The <a href="#verify-codes" className="underline font-bold">Verify OTP codes</a>{' '}
          guide shows the whole flow.
        </Callout>
      </DocsSection>

      {/* ================================================================ Quickstart */}
      <DocsSection id="quickstart" eyebrow="Getting started" title="Quickstart">
        <Prose>Send your first OTP in about two minutes.</Prose>
        <div className="mt-6">
          <Steps>
            <Step n={1} title="Create an account">
              <Prose>
                <Link href="/register" className="underline font-bold">
                  Sign up
                </Link>{' '}
                and verify your email.
              </Prose>
            </Step>
            <Step n={2} title="Link your WhatsApp">
              <Prose>
                In the dashboard, open <strong>WhatsApp Device</strong>. On your phone, open WhatsApp →{' '}
                <strong>Settings → Linked Devices → Link a device</strong> and scan the QR code. The status turns
                green when it is connected.
              </Prose>
            </Step>
            <Step n={3} title="Create an API key">
              <Prose>
                Open <strong>API Keys</strong> → <strong>Generate</strong>. Save the key in an environment variable on
                your server, not in your code.
              </Prose>
              <div className="max-w-2xl">
                <CodePanel tabs={ENV_SNIPPET} />
              </div>
            </Step>
            <Step n={4} title="Send an OTP">
              <Prose>Replace the number with your own and run it.</Prose>
              <div className="max-w-3xl">
                <CodePanel tabs={sendOtp} syncLanguage />
              </div>
            </Step>
            <Step n={5} title="Check your phone">
              <Prose>
                The code arrives on WhatsApp within a few seconds. The request also shows up in{' '}
                <strong>Message Logs</strong> in the dashboard.
              </Prose>
            </Step>
          </Steps>
        </div>
        <Callout title="NO CODE? USE THE MESSAGE TESTER">
          Dashboard → <strong>Message Tester</strong> sends a real OTP from the browser, so you can see the full flow
          before writing any code.
        </Callout>
      </DocsSection>

      {/* ================================================================ Authentication */}
      <DocsSection id="authentication" eyebrow="Basics" title="Authentication">
        <Split aside={<CodePanel title="Request headers" tabs={AUTH_SNIPPETS} />}>
          <Prose>
            Every request needs an API key. Send it in the <InlineCode>x-api-key</InlineCode> header, or as{' '}
            <InlineCode>Authorization: Bearer &lt;key&gt;</InlineCode>. Both work the same way.
          </Prose>
          <Prose>
            Keys start with <InlineCode>_ars_2k03_</InlineCode> followed by 48 characters. You can create several
            keys, for example one per app or environment, and they all send from your linked number.
          </Prose>
          <SubHeading>Revoking a key</SubHeading>
          <Prose>
            Delete a key in <strong>API Keys</strong> and it stops working right away. Requests that use it get{' '}
            <InlineCode>401 Unauthorized</InlineCode>.
          </Prose>
          <Callout tone="warn" title="KEEP KEYS ON YOUR SERVER">
            Anyone with your key can send messages from your number. Never put it in browser or mobile app code, and
            never commit it to git. If a key leaks, delete it and create a new one.
          </Callout>
        </Split>
      </DocsSection>

      {/* ================================================================ Phone format */}
      <DocsSection id="phone-format" eyebrow="Basics" title="Phone number format">
        <Prose>
          Send the number with its country code. Spaces, dashes, brackets and <InlineCode>+</InlineCode> are removed
          for you, and Bangladeshi local numbers that start with <InlineCode>0</InlineCode> get{' '}
          <InlineCode>880</InlineCode> added. After cleaning, the number must have 10 to 15 digits.
        </Prose>
        <div className="max-w-4xl">
          <DocsTable
            head={['YOU SEND', 'SENT TO', 'RESULT']}
            rows={[
              ['+8801712345678', <InlineCode key="a">8801712345678</InlineCode>, '✓ Works'],
              ['01712345678', <InlineCode key="b">8801712345678</InlineCode>, '✓ Works (Bangladeshi local format)'],
              ['+880 1712-345678', <InlineCode key="c">8801712345678</InlineCode>, '✓ Works'],
              ['+14155550123', <InlineCode key="d">14155550123</InlineCode>, '✓ Works (any country)'],
              ['12345', '—', '✗ 400: invalid number (needs 10–15 digits)'],
            ]}
          />
        </div>
      </DocsSection>

      {/* ================================================================ Rate limits */}
      <DocsSection id="rate-limits" eyebrow="Basics" title="Rate limits">
        <Split
          aside={
            <CodePanel
              title="Response"
              status={{ text: '429 TOO MANY REQUESTS', ok: false }}
              kind="json"
              tabs={[ERROR_EXAMPLES.find((e) => e.id === '429')!]}
            />
          }
        >
          <Prose>
            Each IP address can make <strong>30 requests per minute</strong>. Extra requests get{' '}
            <InlineCode>429 Too Many Requests</InlineCode>. Wait a minute, then try again.
          </Prose>
          <Callout tone="warn" title="PROTECT YOUR OWN ENDPOINT TOO">
            Limit how often one user can ask for a code in your app (for example, once every 60 seconds). Otherwise
            one person can use up your limit and spam numbers from your WhatsApp.
          </Callout>
        </Split>
      </DocsSection>

      {/* ================================================================ Send OTP */}
      <DocsSection id="send-otp" eyebrow="API reference" title="Send an OTP">
        <Split
          aside={
            <>
              <CodePanel title="POST /send-otp" tabs={sendOtp} syncLanguage />
              <CodePanel title="Response" status={{ text: '200 OK', ok: true }} kind="json" tabs={[{ id: 'res', label: 'JSON', code: SUCCESS_RESPONSE }]} />
            </>
          }
        >
          <div className="inline-flex items-center gap-2 font-mono text-sm font-extrabold border-2 border-[#1a1a1a] bg-[#ede5d3] shadow-[3px_3px_0px_#1a1a1a] px-2.5 py-1.5 mb-4 max-w-full">
            <span className="text-[11px] bg-[#2e6930] text-[#fbf8f1] px-1.5 py-0.5">POST</span>
            <span className="break-all">{apiUrl}/send-otp</span>
          </div>
          <Prose>
            Sends a verification code to a WhatsApp number. The user gets a message with the code and a one-tap{' '}
            <strong>Copy Code</strong> button. A <InlineCode>200</InlineCode> response means WhatsApp accepted the
            message.
          </Prose>

          <SubHeading>Headers</SubHeading>
          <ParamList
            params={[
              {
                name: 'x-api-key',
                type: 'string',
                required: true,
                children: (
                  <>
                    Your API key. You can use <InlineCode>Authorization: Bearer &lt;key&gt;</InlineCode> instead.
                  </>
                ),
              },
              {
                name: 'Content-Type',
                type: 'string',
                required: true,
                children: <InlineCode>application/json</InlineCode>,
              },
            ]}
          />

          <SubHeading>Body parameters</SubHeading>
          <ParamList
            params={[
              {
                name: 'phoneNumber',
                type: 'string',
                required: true,
                children: (
                  <>
                    The recipient&apos;s WhatsApp number with country code. See{' '}
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
                  <>
                    The code to send, as a string (for example <InlineCode>&quot;{EXAMPLE_OTP}&quot;</InlineCode>). It
                    is shown in bold and copied by the button. Your app generates and checks it.
                  </>
                ),
              },
            ]}
          />
          <p className="font-serif text-sm text-[#524d43] mt-3">Other fields in the body are ignored.</p>

          <SubHeading>Response fields</SubHeading>
          <ParamList
            params={[
              { name: 'statusCode', type: 'number', children: <>Always <InlineCode>200</InlineCode> on success.</> },
              { name: 'success', type: 'boolean', children: <>Always <InlineCode>true</InlineCode> on success.</> },
              {
                name: 'message',
                type: 'string',
                children: <><InlineCode>&quot;OTP sent successfully&quot;</InlineCode></>,
              },
              {
                name: 'data.messageId',
                type: 'string',
                children: (
                  <>
                    WhatsApp&apos;s ID for this message. Save it if you want to match the request with the entry in{' '}
                    <a href="#message-logs" className="underline">
                      Message Logs
                    </a>
                    .
                  </>
                ),
              },
              {
                name: 'data.recipientJid',
                type: 'string',
                children: (
                  <>
                    The WhatsApp address the code was sent to, for example{' '}
                    <InlineCode>8801712345678@s.whatsapp.net</InlineCode>. Shows which number was used after
                    formatting.
                  </>
                ),
              },
            ]}
          />
        </Split>
      </DocsSection>

      {/* ================================================================ Verify guide */}
      <DocsSection id="verify-codes" eyebrow="Guide" title="Verify OTP codes">
        <Split aside={<CodePanel title="otp.js / otp.py" tabs={verifyFlowSnippets(apiUrl)} syncLanguage />}>
          <Prose>
            WA Gateway only delivers the code, so checking it is up to your app. A safe flow has two parts:
          </Prose>
          <ol className="list-decimal pl-5 space-y-2 font-serif text-[#524d43] max-w-[70ch] mb-4">
            <li>
              <strong className="text-[#1a1a1a]">Send:</strong> generate a random 6-digit code, save a{' '}
              <em>hash</em> of it with an expiry time, then call <InlineCode>POST /send-otp</InlineCode>.
            </li>
            <li>
              <strong className="text-[#1a1a1a]">Verify:</strong> when the user types the code, compare its hash with
              the saved one. Delete it after success, after it expires, or after too many wrong tries.
            </li>
          </ol>
          <SubHeading>Why these rules</SubHeading>
          <ParamList
            params={[
              {
                name: 'Random codes',
                type: 'security',
                children: (
                  <>
                    Use <InlineCode>crypto.randomInt</InlineCode> or <InlineCode>secrets</InlineCode>, not{' '}
                    <InlineCode>Math.random</InlineCode>, so codes cannot be guessed.
                  </>
                ),
              },
              {
                name: 'Store a hash',
                type: 'security',
                children: <>If your database leaks, the codes inside it are useless.</>,
              },
              {
                name: '5-minute expiry',
                type: 'security',
                children: (
                  <>
                    Matches the &quot;expires in 5 minutes&quot; text users see. WA Gateway does not enforce it; your
                    app must.
                  </>
                ),
              },
              {
                name: '5 attempts max',
                type: 'security',
                children: <>Stops someone from trying all 1,000,000 codes.</>,
              },
              {
                name: 'Single use',
                type: 'security',
                children: <>Delete the code once it is used so it cannot be reused.</>,
              },
            ]}
          />
        </Split>
      </DocsSection>

      {/* ================================================================ Error handling guide */}
      <DocsSection id="handle-errors" eyebrow="Guide" title="Handle errors">
        <Split aside={<CodePanel title="Handling each status" tabs={errorHandlingSnippets(apiUrl)} syncLanguage />}>
          <Prose>Errors fall into two groups, and your app should treat them differently:</Prose>
          <div className="grid gap-3 max-w-[70ch]">
            <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] p-4">
              <div className="font-mono text-xs font-extrabold text-[#b45309]">400 · 429 → THE USER CAN FIX IT</div>
              <p className="font-serif text-sm text-[#524d43] mt-1">
                Show a friendly message: &quot;Check your number&quot; or &quot;Please wait a minute and try
                again&quot;.
              </p>
            </div>
            <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] p-4">
              <div className="font-mono text-xs font-extrabold text-[#7a2020]">401 · 503 → YOU NEED TO FIX IT</div>
              <p className="font-serif text-sm text-[#524d43] mt-1">
                Your key is wrong or your WhatsApp is disconnected. Retrying will not help. Alert your team and show
                the user a general &quot;try again later&quot; message.
              </p>
            </div>
          </div>
          <Callout title="SET A TIMEOUT">
            Sending usually takes a second or two. Set a timeout of about 15 seconds so a slow request never blocks
            your app.
          </Callout>
        </Split>
      </DocsSection>

      {/* ================================================================ Errors */}
      <DocsSection id="errors" eyebrow="Reference" title="Error codes">
        <Split aside={<CodePanel title="Error response" kind="json" tabs={ERROR_EXAMPLES} />}>
          <Prose>
            Errors return a non-2xx status and a JSON body. <InlineCode>message</InlineCode> explains what went wrong;
            for missing or invalid fields it is a <strong>list</strong> of messages.
          </Prose>
          <DocsTable
            head={['STATUS', 'MEANING', 'WHAT TO DO']}
            rows={[
              ['400', 'phoneNumber or otp is missing or not a string', 'Send both fields as strings.'],
              ['400', 'Invalid phone number', 'Use 10–15 digits with the country code.'],
              ['400', 'Number is not registered on WhatsApp', 'Ask the user for a WhatsApp number.'],
              ['401', 'API key missing, invalid or revoked', 'Check the header and that the key still exists.'],
              ['429', 'More than 30 requests in a minute', 'Wait a minute, then retry.'],
              ['503', 'Your WhatsApp is not connected', 'Dashboard → WhatsApp Device → scan the QR again.'],
            ]}
          />
        </Split>
      </DocsSection>

      {/* ================================================================ Message preview */}
      <DocsSection id="message-preview" eyebrow="Reference" title="What users receive">
        <Split
          aside={<WhatsAppPreview otp={EXAMPLE_OTP} />}
        >
          <Prose>
            This is exactly how the <strong>default</strong> message looks in the user&apos;s WhatsApp. Try the{' '}
            <strong>Copy Code</strong> button: it copies the code, just like on a real phone. You can replace this
            message with your own; see{' '}
            <a href="#custom-template" className="underline">
              Custom template
            </a>
            .
          </Prose>
          <ol className="mt-5 space-y-4 max-w-[70ch]">
            {[
              [
                'Sender',
                'Your linked WhatsApp number. Users see your name instead if they saved you as a contact.',
              ],
              ['The code', 'Your otp value, in bold, followed by a short security warning.'],
              ['Footer and time', 'A note that the code expires in 5 minutes, and when it arrived.'],
              [
                'Copy Code button',
                'One tap copies the code to the clipboard, so users can paste it into your app without typing.',
              ],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <Marker n={i + 1} />
                <div>
                  <div className="font-mono text-[13px] font-extrabold text-[#1a1a1a]">{title}</div>
                  <p className="font-serif text-sm text-[#524d43] leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Callout tone="warn" title='ABOUT "EXPIRES IN 5 MINUTES"'>
            WA Gateway does not expire codes; your app decides how long a code stays valid. With the default message,
            use 5 minutes so the message stays true. If your codes last longer, change the footer in a custom template.
          </Callout>
        </Split>
      </DocsSection>

      {/* ================================================================ Custom template */}
      <DocsSection id="custom-template" eyebrow="Reference" title="Custom template">
        <Split aside={<CustomTemplateExample otp={EXAMPLE_OTP} />}>
          <Prose>
            Don&apos;t want the default message? Write your own in{' '}
            <strong>Dashboard → Custom Template</strong>. Once saved, every OTP you send uses it automatically. Your API
            requests stay exactly the same; only the message your users see changes.
          </Prose>

          <SubHeading>What you can change</SubHeading>
          <DocsTable
            head={['PART', 'RULES']}
            rows={[
              [
                'Message',
                <>
                  Any text up to 1024 characters. It must include <InlineCode>{'{{code}}'}</InlineCode> where the OTP
                  goes.
                </>,
              ],
              ['Footer', 'Optional small grey text under the message, up to 60 characters.'],
              ['Copy Code button', 'Turn it on or off.'],
              ['Button text', 'The button label, up to 20 characters. Defaults to "Copy Code".'],
            ]}
          />

          <SubHeading>Writing the message</SubHeading>
          <ul className="space-y-1.5 font-serif text-sm text-[#524d43] max-w-[70ch] list-disc pl-5">
            <li>
              <InlineCode>{'{{code}}'}</InlineCode> is the only placeholder. Write everything else, such as your app
              name, directly in the text.
            </li>
            <li>
              WhatsApp formatting works: <InlineCode>*bold*</InlineCode>, <InlineCode>_italic_</InlineCode>,{' '}
              <InlineCode>~strike~</InlineCode> and <InlineCode>```mono```</InlineCode>. Emoji are fine too.
            </li>
            <li>The dashboard shows a live WhatsApp preview while you type, like the one on the right.</li>
          </ul>

          <Callout tone="tip" title="WITH OR WITHOUT THE BUTTON">
            With the button on, the footer appears as small grey text and users can copy the code in one tap. With it
            off, the message is sent as plain text and the footer becomes its last line, in italics. Use the switch on
            the right to compare.
          </Callout>

          <Prose>
            To go back to the default message, choose <strong>Reset to default</strong> on the same page.
          </Prose>
        </Split>
      </DocsSection>

      {/* ================================================================ Message logs */}
      <DocsSection id="message-logs" eyebrow="Reference" title="Message logs">
        <Prose>
          Every successful send is recorded in the dashboard under <strong>Message Logs</strong>, with the recipient,
          the time, the <InlineCode>messageId</InlineCode> and the status. You can search by phone number or message
          ID. Use it to check whether a code was
          sent when a user says they did not get one. The last 100 messages are shown.
        </Prose>
      </DocsSection>

      {/* ================================================================ Best practices */}
      <DocsSection id="best-practices" eyebrow="Reference" title="Best practices">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ['Call from your server', 'Keep your API key in an environment variable on the server.'],
            ['Limit requests per user', 'Allow one code per user every 60 seconds to stop abuse.'],
            ['Expire codes after 5 minutes', 'Matches the message users see.'],
            ['Use one key per app', 'If one leaks, you revoke only that key.'],
            ['Watch for 503', 'It means your phone was unlinked. Relink it quickly so logins keep working.'],
            ['Keep the device linked', 'If you log out of WhatsApp or remove the linked device, sending stops with 503.'],
          ].map(([title, body]) => (
            <li key={title} className="border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[3px_3px_0px_#1a1a1a] p-4">
              <div className="font-mono text-[13px] font-extrabold">✓ {title}</div>
              <p className="font-serif text-sm text-[#524d43] mt-1">{body}</p>
            </li>
          ))}
        </ul>
      </DocsSection>

      {/* ================================================================ FAQ */}
      <DocsSection id="faq" eyebrow="Reference" title="FAQ">
        <div className="border-t-2 border-[#1a1a1a] max-w-4xl">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-[#d6cdb8] py-3">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-mono text-[13px] font-extrabold text-[#1a1a1a]">
                {item.q}
                <span className="text-[#7a2020] transition-transform group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <p className="font-serif text-sm text-[#524d43] mt-2 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </DocsSection>

      {/* ================================================================ Next steps */}
      <section>
        <h2 className="font-serif text-[28px] font-black text-[#1a1a1a] mb-4">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
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
