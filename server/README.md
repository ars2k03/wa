# WhatsApp OTP Gateway — Backend Service

A high-performance, asynchronous REST backend engine for multi-tenant WhatsApp OTP delivery and device session management.

Built with **NestJS 12**, **Baileys (WebSockets)**, **Prisma ORM**, **PostgreSQL**, **Redis**, and **Google APIs**.

---

## 📖 Quick Links
- **Full API Documentation**: [`docs/API.md`](./docs/API.md) *(Endpoints, Request/Response JSON, and cURL workflows)*
- **Frontend Console Guide**: [`../frontend/README.md`](../frontend/README.md) *(Operator dashboard & UI)*

---

## Architecture Overview

* **Baileys Multi-Device Engine**: Direct WhatsApp Web socket connections with automatic reconnection and keep-alive heartbeats.
* **Redis Multi-Tenant Auth State**: Saves cryptographic keys, credentials, and pairing state in Redis with zero file-system lock contention.
* **Prisma & PostgreSQL**: Stores persistent users, hashed passwords, developer API keys, WhatsApp session records, and audit logs.
* **Email Verification**: Dispatches 6-digit verification codes using the official Gmail REST API via OAuth2.
* **Security & Protection**:
  * Helmet security headers
  * ThrottlerGuard rate limiting (30 requests/minute)
  * Constant-time comparison for OTP validation against timing attacks
  * IDOR prevention across multi-user sessions and API keys

---

## Environment Configuration

Create a `.env` file in this directory based on `.env.example`:

```bash
PORT=3002
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Database & Cache
DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp_gateway?schema=public"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your_jwt_secret_key_change_in_production"
JWT_EXPIRES_IN="7d"

# Google Mail API (OAuth2)
GMAIL_USER="your-email@gmail.com"
GMAIL_CLIENT_ID="your-google-client-id"
GMAIL_CLIENT_SECRET="your-google-client-secret"
GMAIL_REFRESH_TOKEN="your-google-refresh-token"
```

---

## Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client & apply database migrations
npm run prisma:generate
npm run prisma:migrate

# 3. Start development server with file watch
npm run start:dev

# 4. Production build & start
npm run build
npm run start:prod
```

Once running, the backend listens at `http://localhost:3002`.

---

## Testing & Quality

```bash
# Run tests with Vitest
npm run test

# Run e2e tests
npm run test:e2e

# Run linter
npm run lint
```
