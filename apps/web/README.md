# The Telegraphic Dispatch — WhatsApp Gateway Frontend

A bespoke, production-ready SaaS operator console and marketing interface for the **Multi-Tenant WhatsApp OTP Gateway**, engineered with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**.

---

## 📜 Aesthetic Identity & Design System

This frontend departs from generic SaaS dashboard templates by implementing a distinct **Vintage Newsprint Broadsheet & Retro Editorial Brutalism** design language (inspired by traditional printing presses and linotype broadsheets):

* **Color Palette**:
  * Newsprint Cream: `#fbf8f1`
  * Aged Paper Tint: `#f4efe2`
  * Printer Ink Black: `#1a1a1a`
  * Muted Charcoal Ink: `#524d43`
  * Editorial Oxblood / Burgundy: `#7a2020`
  * Official Stamp Green: `#2e6930` (active WhatsApp status)
  * Alert Amber: `#b45309` (pairing / scanning state)
* **Tactile Mechanical Feedback**: Hard solid borders (`2px border-[#1a1a1a]`) with offset drop shadows (`shadow-[3px_3px_0px_#1a1a1a]`) and tactile press states (`active:translate-x-[2px] active:translate-y-[2px]`).
* **Typography**: Elegant editorial serif headlines paired with high-legibility monospace fonts for codes, keys, and timestamps.

---

## 🚀 Pages & Core Features

### 1. Broadsheet Front Page (`/`)
* **Newspaper Masthead**: Editorial headline bar featuring a real-time gateway status indicator and live date ticker.
* **Telegraph Terminal Simulation**: Interactive terminal demonstrating rapid OTP dispatching.
* **Architectural Capability Cards**: 6-column editorial grid showcasing Baileys WebSockets, Redis session isolation, cryptographic key minting, and rate limiting.
* **Operating Protocol**: 3-stage visual guide: *Account Enrollment → Apparatus Handshake → Wire Dispatch*.
* **Multi-Language Wire Snippets**: Ready-to-copy code samples in **cURL**, **Node.js**, **Python**, **PHP**, and **Go**.

### 2. Authentication Suite (`/(auth)`)
* **Register (`/register`)**: Account creation with validation and automatic 6-digit email OTP dispatch via Gmail API.
* **Email Verification (`/verify`)**: Dedicated 6-digit OTP code input screen with countdown timer and resend functionality.
* **Login (`/login`)**: Operator authentication with persistent JWT session management (`AuthContext`).

### 3. Central Dispatch Console (`/dashboard`)
* **WhatsApp Device (QR Pairing)**:
  * Live Base64 QR code rendering with adaptive status polling (every 2.5 seconds while pairing, 5 seconds otherwise).
  * Instant status indicator (`qr_ready`, `connecting`, `connected`, `disconnected`) and the linked phone number.
* **API Keys**:
  * Mint unique cryptographic keys (`_ars_2k03_...`).
  * One-click clipboard copy and permanent key revocation.
* **Custom Template**:
  * Edit the WhatsApp OTP message: body with `{{code}}`, footer, and an optional one-tap copy button with custom label.
  * Live WhatsApp-style preview, length limits, and one-click reset to the default template.
* **Playground**:
  * Form to send real WhatsApp OTPs through `/send-otp` with your API key.
  * Request latency measurement and a response inspector with copy-as-JSON.
* **Message Logs**:
  * Table of sent messages with recipient numbers, delivery status, and Baileys message IDs.
* **Usage**:
  * Today's and this month's OTP usage against the limits (100/day, 3,000/month, Bangladesh time), reset times, and a 30-day history chart.

### 4. Developer Docs (`/docs`)
* Public integration guide: quickstart, authentication, phone number format, rate & usage limits, sending and verifying OTPs, error handling, message preview, custom templates, message logs, best practices, and FAQ.
* Ready-to-copy code samples in **cURL**, **Node.js**, **Python**, **PHP**, and **Go** with a synced language picker.
* Mobile-friendly layout: code blocks scroll sideways only on small screens, so the page always scrolls normally.

---

## 📁 Directory Structure

```text
apps/web/
├── public/                 # Static assets, favicon, icons
├── src/
│   ├── app/                # Next.js 16 App Router
│   │   ├── (auth)/         # Authentication route group
│   │   │   ├── login/      # Sign-in page
│   │   │   ├── register/   # Sign-up page
│   │   │   └── verify/     # Email OTP verification page
│   │   ├── (homepage)/     # Broadsheet landing page
│   │   ├── dashboard/      # Operator console (Device, Keys, Template, Playground, Logs, Usage)
│   │   ├── docs/           # Public developer documentation page
│   │   ├── globals.css     # Tailwind v4 theme, fonts & print styling
│   │   └── layout.tsx      # Root HTML & body shell
│   ├── components/         # Reusable UI elements, terminals, forms & tables
│   ├── context/            # AuthContext (JWT, user state) & DashboardTabContext
│   ├── hooks/              # Data hooks (session polling, API keys, logs, OTP template, usage)
│   ├── lib/                # API client wrapper & HTTP helpers
│   ├── types/              # TypeScript interfaces (User, Session, ApiKey, ...)
│   └── utils/              # Helpers, docs code snippets & OTP template validation
├── .env.example            # Environment variables template
├── .env.local              # Local environment configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies & scripts
├── DESIGN.md               # Visual design system specifications
└── README.md
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the `apps/web/` directory:

```bash
# Backend Gateway API Base URL
# Local development:
NEXT_PUBLIC_API_URL=http://localhost:3002

# Production deployment:
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js**: `v20.x`, `v22.x`, or `v24.x`
* **pnpm**: `v12.x` or higher
* **Running Backend**: Ensure the NestJS backend gateway is running on port `3002`.

### Installation & Run

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

4. **Access the Application**:
   Open your browser and navigate to:
   * **Landing Page**: [http://localhost:3000](http://localhost:3000)
   * **Operator Console**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   * **Developer Docs**: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 📦 Available Scripts

* `pnpm dev` — Launch Next.js development server with Turbopack / HMR at `http://localhost:3000`
* `pnpm build` — Create an optimized production build
* `pnpm start` — Start the production server
* `pnpm lint` — Run ESLint checks across the codebase

---

## 🔗 Related Documentation

* **Backend Service**: [`../server/README.md`](../server/README.md)
* **Complete REST API Specification**: [`../server/docs/API.md`](../server/docs/API.md)
* **Editorial Design System**: [`./DESIGN.md`](./DESIGN.md)
