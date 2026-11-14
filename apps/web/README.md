<div align="center">

<img src="public/icon.svg" width="96" height="96" alt="WA Gateway logo" />

# WA Gateway Web

**Website, developer docs and dashboard for WA Gateway.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

[Live site](https://wa.ars2k03.tech) · [Project README](../../README.md) · [Server](../server/README.md) · [Design system](DESIGN.md)

</div>

---

## Overview

The web app is where users create an account, link WhatsApp, manage API keys and read the integration guide. It runs on port `3000` in development and calls the [server](../server/README.md) for all data.

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing page | Product overview, animated cURL demo and 4-step setup guide |
| `/register` | Register | Create an account and receive an email code |
| `/verify` | Verify | Enter the 6-digit code, with a countdown and resend option |
| `/login` | Login | Sign in to the dashboard |
| `/dashboard` | Dashboard | Manage devices, keys, templates, logs and usage |
| `/docs` | Developer docs | Public integration guide and API examples |

## Dashboard

| Tab | Description |
|---|---|
| **WhatsApp Device** | Link WhatsApp by QR code and watch the connection status, polled every 2.5 seconds while pairing and every 5 seconds otherwise |
| **API Keys** | Create and revoke keys; a full key is shown only once, when it is created |
| **Custom Template** | Edit the message body, footer and copy button, with a live WhatsApp-style preview |
| **Playground** | Paste your API key, send a real OTP and inspect the response and latency |
| **Message Logs** | Review recipients, delivery status and message IDs |
| **Usage** | Compare usage with the daily and monthly limits, and view 30 days of history |

## Developer Docs

The `/docs` page covers the quickstart, authentication, phone number format, limits, sending and verifying OTPs, error handling, custom templates, message logs and best practices. Code samples are available in cURL, Node.js, Python, PHP and Go.

## Design

The interface uses a vintage newsprint and editorial brutalist style: cream paper tones, ink-black borders, hard offset shadows, serif headlines and monospace details. Read [`DESIGN.md`](DESIGN.md) before changing UI code.

## Project Structure

```
apps/web/
├── public/               # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/       # Login, register and verify pages
│   │   ├── (homepage)/   # Landing page
│   │   ├── dashboard/    # Dashboard
│   │   ├── docs/         # Developer docs
│   │   ├── globals.css   # Tailwind theme and global styles
│   │   └── layout.tsx    # Root layout
│   ├── components/
│   │   ├── common/       # Site navbar and footer
│   │   ├── dashboard/    # Dashboard tabs and navigation
│   │   ├── docs/         # Docs navigation and previews
│   │   ├── landing/      # Landing page sections
│   │   └── ui/           # Shared UI components
│   ├── context/          # Auth and dashboard tab state
│   ├── hooks/            # Data hooks
│   ├── lib/              # API client
│   ├── types/            # Shared types
│   └── utils/            # Helpers, code snippets and template validation
├── DESIGN.md             # Design system
└── next.config.ts        # Next.js configuration
```

## Getting Started

You need Node.js 24 or newer, pnpm 12 and a running [server](../server/README.md). Run these commands from the repository root.

1. Install dependencies and create the env file:
   ```bash
   pnpm install
   cp apps/web/.env.example apps/web/.env.local
   ```
2. Set the API URL in `apps/web/.env.local`:

   | Variable | Description |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | Server URL (`http://localhost:3002` locally, `https://wapi.ars2k03.tech` in production) |

3. Start the development server:
   ```bash
   pnpm --filter web dev
   ```

The site opens at <http://localhost:3000>.

## Scripts

Run with `pnpm --filter web <script>`.

| Script | Description |
|---|---|
| `dev` | Start the development server |
| `build` | Create a production build |
| `start` | Run the production build |
| `lint` | Lint with ESLint |

## License

[MIT](../../LICENSE) © 2026 A R S Arafat.
