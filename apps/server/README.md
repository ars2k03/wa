<div align="center">

<img src="../web/public/icon.svg" width="96" height="96" alt="WA Gateway logo" />

# WA Gateway Server

**REST API for multi-tenant WhatsApp OTP delivery and device session management.**

![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)

[Project README](../../README.md) · [API reference](docs/API.md) · [Postman collection](docs/postman_collection.json) · [Web app](../web/README.md)

</div>

---

## Overview

The server links WhatsApp numbers through [Baileys](https://github.com/WhiskeySockets/Baileys), issues API keys and sends OTP messages on behalf of each user. It listens on port `3002` by default.

| Area | Technology |
|---|---|
| Framework | NestJS 12 |
| WhatsApp | Baileys over WebSockets |
| Database | PostgreSQL with Prisma 7 |
| Session state | Redis |
| Email | Gmail API with OAuth2 |
| Tooling | TypeScript 6, Vitest, oxlint, Prettier |

## Architecture

- **WhatsApp sessions:** each user links a device by QR code. Dropped connections reconnect automatically, and active sessions are restored when the server starts.
- **Auth state:** credentials, keys and pairing state are stored in Redis, so no session files are written to disk.
- **Persistence:** PostgreSQL stores users, API keys, session records, message logs, OTP templates and usage counters.
- **Email verification:** new accounts confirm a 6-digit code sent through Gmail. The code expires after 10 minutes.
- **OTP templates:** each user can set a message body with `{{code}}`, a footer and an optional one-tap copy button, or use the default.
- **Usage limits:** each user can send 100 OTPs a day and 3,000 a month, in Bangladesh time. Only successful sends count, and a full limit returns `429`.

### Security

- Helmet headers and an origin allowlist for CORS
- Rate limiting of 30 requests a minute
- Passwords hashed with bcrypt
- API keys stored only as SHA-256 hashes, and shown once when created
- Constant-time comparison of email verification codes
- Ownership checks on sessions and API keys

## Modules

| Module | Path | Responsibility |
|---|---|---|
| Auth | [`src/auth`](src/auth) | Registration, login and JWT guard |
| Email OTP | [`src/otp`](src/otp) | Email verification codes |
| API keys | [`src/api_key`](src/api_key) | Key creation, revocation and API key guard |
| Sessions | [`src/whatsapp_session`](src/whatsapp_session) | QR pairing, connection state and reconnects |
| WhatsApp | [`src/whatsapp`](src/whatsapp) | `POST /send-otp` and message logs |
| OTP templates | [`src/otp_template`](src/otp_template) | Custom message templates |
| Usage | [`src/usage`](src/usage) | Daily and monthly limits and history |
| Prisma | [`src/prisma`](src/prisma) | Database client |
| Redis | [`src/redis`](src/redis) | Baileys auth state store |

## API

| Group | Endpoints | Auth |
|---|---|---|
| Health | `GET /` | Public |
| Accounts | `POST /auth/register`, `POST /auth/login` | Public |
| Profile | `GET /auth/me` | JWT |
| Email verification | `POST /otp/send`, `POST /otp/verify` | Public |
| API keys | `POST /api-keys`, `GET /api-keys/:userId`, `DELETE /api-keys/:keyId` | JWT |
| Sessions | `POST /sessions/:sessionId/init`, `GET /sessions/:sessionId/status`, `DELETE /sessions/:sessionId` | JWT |
| Sending | `POST /send-otp` | API key |
| Message logs | `GET /message-logs` | JWT |
| OTP template | `GET`, `PUT`, `DELETE /otp-template` | JWT |
| Usage | `GET /usage` | JWT |

Requests and responses are documented in [`docs/API.md`](docs/API.md).

## Getting Started

You need Node.js 24 or newer, pnpm 12, PostgreSQL, Redis and a Google OAuth2 client with Gmail access. Run these commands from the repository root.

1. Install dependencies and create the env file:
   ```bash
   pnpm install
   cp apps/server/.env.example apps/server/.env
   ```
2. Fill in `apps/server/.env`:

   | Variable | Description |
   |---|---|
   | `PORT` | API port, `3002` by default |
   | `NODE_ENV` | Use `development` locally |
   | `ALLOWED_ORIGINS` | Comma-separated origins allowed by CORS |
   | `DATABASE_URL` | PostgreSQL connection string |
   | `REDIS_URL` | Redis connection string |
   | `JWT_SECRET` | Long random secret for signing sessions |
   | `JWT_EXPIRES_IN` | Session lifetime, for example `7d` |
   | `GMAIL_USER` | Address that sends verification emails |
   | `GMAIL_CLIENT_ID` | Google OAuth2 client ID |
   | `GMAIL_CLIENT_SECRET` | Google OAuth2 client secret |
   | `GMAIL_REFRESH_TOKEN` | Google OAuth2 refresh token |

3. Generate the Prisma client and apply the migrations:
   ```bash
   pnpm --filter server prisma:generate
   pnpm --filter server prisma:migrate
   ```
4. Start the server:
   ```bash
   pnpm --filter server dev
   ```

The API runs at <http://localhost:3002> in development, and the live production API is hosted at <https://wapi.ars2k03.tech>.

## Scripts

Run with `pnpm --filter server <script>`.

| Script | Description |
|---|---|
| `dev` | Start the server once, without file watching |
| `start:dev` | Generate the Prisma client and start with file watching |
| `start:debug` | Start in debug mode with file watching |
| `build` | Compile to `dist` |
| `start:prod` | Run the compiled server |
| `prisma:generate` | Generate the Prisma client |
| `prisma:migrate` | Create and apply a migration in development |
| `test` | Run the unit tests |
| `test:watch` | Run the unit tests in watch mode |
| `test:cov` | Run the unit tests with coverage |
| `test:e2e` | Run the end-to-end tests |
| `lint` | Lint with oxlint |
| `format` | Format with Prettier |

## License

[MIT](../../LICENSE) © 2026 A R S Arafat.
