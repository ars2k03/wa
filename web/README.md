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
* **Login (`/login`)**: Operator authentication with persistent JWT session management (`AuthContext`) and one-click demo credentials for zero-friction testing.

### 3. Central Dispatch Console (`/dashboard`)
* **Apparatus Link (QR Pairing)**:
  * Live Base64 QR code rendering with auto-polling (every 2.5 seconds).
  * Direct 8-digit numeric pairing PIN code support as an alternative to QR scanning.
  * Instant status indicator (`qr_ready`, `connecting`, `connected`, `disconnected`).
* **API Key Minting Console**:
  * Mint unique cryptographic keys (`_ars_2k03_...`).
  * One-click clipboard copy, session binding, and permanent key revocation.
* **Live OTP Tester**:
  * Classified-ad style form to dispatch real authenticated WhatsApp messages directly to `/send-otp`.
  * Real-time network latency measurement and live response tape inspector.
* **Message Ledger**:
  * Ruled ledger table listing dispatched messages, recipient numbers, delivery states, and unique Baileys message IDs.
* **API Documentation Viewer**:
  * Built-in REST reference covering headers, request bodies, and error codes.

---

## 📁 Directory Structure

```text
frontend/
├── public/                 # Static assets, favicon, icons
├── src/
│   ├── app/                # Next.js 16 App Router
│   │   ├── (auth)/         # Authentication route group
│   │   │   ├── login/      # Sign-in page
│   │   │   ├── register/   # Sign-up page
│   │   │   └── verify/     # Email OTP verification page
│   │   ├── (homepage)/     # Broadsheet landing page
│   │   ├── dashboard/      # Operator console (QR, Keys, Tester, Ledger)
│   │   ├── globals.css     # Tailwind v4 theme, fonts & print styling
│   │   └── layout.tsx      # Root HTML & body shell
│   ├── components/         # Reusable UI elements, terminals, forms & tables
│   ├── context/            # AuthContext (JWT, user state, localStorage)
│   ├── hooks/              # Custom React hooks (polling, clipboard, etc.)
│   ├── lib/                # API client wrapper & HTTP helpers
│   ├── types/              # TypeScript interfaces (User, Session, ApiKey)
│   └── utils/              # Formatting & helper utilities
├── .env.example            # Environment variables template
├── .env.local              # Local environment configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies & scripts
├── DESIGN.md               # Visual design system specifications
└── README.md
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

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
* **npm**: `v9.x` or higher
* **Running Backend**: Ensure the NestJS backend gateway is running on port `3002`.

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open your browser and navigate to:
   * **Landing Page**: [http://localhost:3000](http://localhost:3000)
   * **Operator Console**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 📦 Available Scripts

* `npm run dev` — Launch Next.js development server with Turbopack / HMR at `http://localhost:3000`
* `npm run build` — Create an optimized production build
* `npm run start` — Start the production server
* `npm run lint` — Run ESLint checks across the codebase

---

## 🔗 Related Documentation

* **Backend Service**: [`../backend/README.md`](../backend/README.md)
* **Complete REST API Specification**: [`../backend/docs/API.md`](../backend/docs/API.md)
* **Editorial Design System**: [`./DESIGN.md`](./DESIGN.md)
