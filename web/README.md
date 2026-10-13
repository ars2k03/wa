# THE TELEGRAPHIC DISPATCH — WhatsApp Gateway SaaS Frontend

A bespoke, production-ready SaaS frontend interface engineered for the Multi-Tenant WhatsApp Gateway built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS**.

Directly implements the **Vintage Newsprint Broadsheet & Retro Editorial Brutalism** design language specified in [DESIGN.md](./DESIGN.md) (warm newsprint cream `#fbf8f1`, printer ink `#1a1a1a`, oxblood burgundy `#7a2020`, official stamp green `#2e6930`, hard 3px offset drop shadows, tactile button feedback, and editorial column layouts).

---

## Architecture & Features

### 1. Broadsheet Front Page (`/`)
- Vintage newspaper masthead with live gateway status indicator and date ticker.
- High-velocity hero section with interactive telegraph dispatch terminal simulation.
- 6-column architectural capability cards (Session Isolation, Baileys WebSockets, Cryptographic Key Minting, etc.).
- 3-stage operating manual (Account Enrollment → Apparatus Handshake → Wire Dispatch).
- Multi-language wire protocol code preview (cURL, Node.js, Python, PHP, Go).

### 2. Authentication (`/login`, `/register`)
- Sovereign operator account enrollment and sign-in.
- State persistence via `AuthContext` (JWT & local storage).
- One-click demo credentials autofill for zero-friction testing.

### 3. Central Dispatch Console (`/dashboard`)
- **Apparatus Link (QR)**: Live Base64 QR code rendering with auto-polling (2.5s) and 8-digit numeric pairing PIN code support.
- **API Key Console**: Mint unique `_ars_2k03_...` keys, one-click copy, session linking, and permanent revocation.
- **Live Tester (OTP)**: Classified-ad order form to submit real authenticated HTTP requests directly to `/send-otp` with live response tape viewer and latency timing.
- **Message Ledger**: Ruled ledger table listing dispatched messages with recipient phone, type, message ID, timestamp, and delivery status badge.
- **Documentation**: Complete REST wire specs, headers, schemas, and curl commands.

---

## Connecting to Backend

The frontend communicates with the backend NestJS service running on port `3002`:

```bash
# In backend directory:
npm run start:dev

# In frontend directory:
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the console.
