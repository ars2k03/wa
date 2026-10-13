# WhatsApp SaaS Frontend Architecture & Specification

## 1. Project Overview
A complete, production-grade SaaS Frontend interface for the Multi-Tenant WhatsApp Gateway built with **Next.js (App Router)**, **React 19**, and **Tailwind CSS**.

### Key Flow:
1. **Visitor Landing (`/`)**: High-converting, modern landing page with live interactive features, benefits, and developer integration preview.
2. **Authentication (`/login`, `/register`)**:
   - Secure account registration (Name, Email, Password).
   - Sign in with state persistence in `AuthContext` (JWT / localStorage).
3. **User Dashboard (`/dashboard`)**:
   - **Device Manager**: Connect personal WhatsApp via high-res Base64 QR code or 8-digit Pairing Code. Real-time status polling (`qr_ready`, `connected`, `disconnected`).
   - **API Key Console**: Generate `_ars_2k03_<hex>` keys, one-click copy, link/unlink to WhatsApp sessions, and revoke keys.
   - **Live API Playground**: Send test OTPs and WhatsApp messages directly from the browser with response JSON viewer.
   - **Message Audit Logs**: Real-time table displaying message history (recipient, delivery status, timestamp, message ID).
   - **Developer Docs**: Code snippets for cURL, Node.js/Fetch, Python, and PHP.

---

## 2. Directory & Component Structure

```
frontend/src/
├── app/
│   ├── page.tsx                     # Landing Page (Hero, Features, Live Demo, CTA)
│   ├── layout.tsx                   # Root Layout with Font, Meta, AuthProvider, Toaster
│   ├── globals.css                  # Modern UI Tokens, Gradients, Glassmorphism
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx             # Login Screen (Email, Password, Remember Me)
│   │   └── register/
│   │       └── page.tsx             # Registration Screen (Name, Email, Password)
│   └── dashboard/
│       └── page.tsx                 # Protected Multi-Tab Dashboard Console
│
├── components/
│   ├── common/
│   │   ├── Navbar.tsx               # Responsive Header with Auth status & CTA
│   │   ├── Footer.tsx               # Modern SaaS Footer
│   │   └── Toast.tsx                # Floating status notifications
│   │
│   ├── landing/
│   │   ├── HeroSection.tsx          # Dynamic Hero with interactive terminal preview
│   │   ├── FeatureGrid.tsx          # Feature highlight cards (Speed, Multi-tenant, Security)
│   │   ├── HowItWorks.tsx           # 3-step visual guide (Register -> Scan -> Send)
│   │   └── CodePreview.tsx          # Interactive multi-language integration preview
│   │
│   ├── dashboard/
│   │   ├── DeviceConnectTab.tsx     # QR Scanner with auto-polling & 8-digit pairing code
│   │   ├── ApiKeyManagerTab.tsx     # _ars_2k03_ key generator, copy button & session link
│   │   ├── MessageTesterTab.tsx     # Live OTP & message dispatch console
│   │   ├── MessageLogsTab.tsx       # Audit logs table with delivery status badges
│   │   └── DeveloperDocsTab.tsx     # Copy-paste ready code examples
│   │
│   └── ui/
│       ├── Button.tsx               # Reusable button with loading states
│       ├── Card.tsx                 # Glassmorphic card container
│       ├── Input.tsx                # Styled form inputs
│       ├── Badge.tsx                # Status indicators (Connected, Pending, Error)
│       └── Modal.tsx                # Clean backdrop dialog
│
├── context/
│   └── AuthContext.tsx              # Auth state provider (user, login, logout, register, token)
│
├── hooks/
│   ├── useWhatsAppSession.ts        # Polling hook for QR code generation & connection status
│   ├── useApiKeys.ts                # Hook to fetch, create, and revoke API keys
│   └── useMessageLogs.ts            # Hook to fetch delivery history
│
└── lib/
    ├── api.ts                       # Typed Axios/Fetch client targeting Backend (Port 3002)
    ├── types.ts                     # TypeScript data contracts (User, ApiKey, Session, Log)
    └── utils.ts                     # Formatting, clipboard copying, date helpers
```

---

## 3. Backend Integration Endpoints (Port 3002)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user account |
| `POST` | `/auth/login` | Login user & return token/session |
| `POST` | `/api-keys` | Generate new API key (`_ars_2k03_...`) |
| `GET` | `/api-keys/:userId` | List user's active API keys |
| `PUT` | `/api-keys/:keyId/link-session` | Associate WhatsApp session to API key |
| `DELETE` | `/api-keys/:keyId` | Revoke/deactivate API key |
| `POST` | `/sessions/:sessionId/init` | Trigger session & generate Base64 QR code |
| `GET` | `/sessions/:sessionId/status` | Poll session status & receive Base64 QR image |
| `POST` | `/sessions/:sessionId/pairing-code`| Request 8-digit phone pairing code |
| `DELETE` | `/sessions/:sessionId` | Logout/disconnect WhatsApp session |
| `POST` | `/send-otp` | Send message via `x-api-key` header |

---

## 4. Housekeeping & Cleanup Rules
- Remove all default Next.js boilerplate SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) from `public/`.
- Replace default starter `app/page.tsx` with the SaaS Landing Page.
- Use curated modern palettes (Slate/Zinc dark mode, Emerald accents for WhatsApp branding).
- Ensure 100% responsiveness on mobile, tablet, and desktop screens.

---

## 5. Mandatory Design Language (See DESIGN.md for full specs)
- **Aesthetic:** Vintage Newsprint Broadsheet + Retro Editorial Brutalism (matching `/home/ars2k03/CSE/PROJECT/personal/ars/`).
- **Color Tokens:** Warm newsprint cream background (`#fbf8f1`), deep ink black (`#1a1a1a`), burgundy accent (`#7a2020`), stamp green (`#2e6930`).
- **Buttons:** 2px solid ink borders with 3px solid hard offset shadows (`shadow-[3px_3px_0px_#1a1a1a]`).
- **Typography:** Classic Editorial Serif headlines + Monospace data/code typography.
- **Rules:** Newspaper column dividers, vintage stamps, and masthead header formatting.
