# Contributing to WA Gateway

Contributions are welcome. By submitting one, you agree that it is licensed under the project's [MIT License](LICENSE) and that you have the right to submit it.

For a large change, open an issue first so the approach can be agreed before you build it.

## Workflow

1. Fork the repository and branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
   Prefixes: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`.
2. Follow [Getting Started](README.md#getting-started) to run the project locally.
3. Make your change in the relevant app under `apps/`.
4. Run the checks for every app you touched:
   ```bash
   pnpm --filter <server|web> lint
   pnpm --filter <server|web> build
   pnpm --filter server test
   ```
5. Open a pull request against `main` and fill in the template.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add resend limit to email verification
fix: keep the expired QR visible until a fresh one arrives
refactor: extract usage period helpers
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`. Add a scope when it helps: `feat(web): add usage chart`.

A change that spans apps (for example a new API endpoint and the dashboard call that uses it) goes in **one** pull request.

## Code Rules

- **Server:** one module per feature, input validated by DTOs, and configuration read through `ConfigService`.
- **Web:** read `apps/web/AGENTS.md` and `apps/web/DESIGN.md` before changing UI code.
- **API changes:** update [`apps/server/docs/API.md`](apps/server/docs/API.md) and the snippets in `apps/web/src/utils/snippets.ts` in the same pull request.
- **OTP templates:** `apps/server/src/otp_template/otp_template.constants.ts` and `apps/web/src/utils/otpTemplate.ts` mirror each other, so change them together.
- **Database:** change `apps/server/prisma/schema.prisma` through a migration, and never edit a migration that has already been merged.

## Dependencies

- Use pnpm only. Never commit `package-lock.json` or `yarn.lock`.
- Add a dependency to one app: `pnpm --filter <server|web> add <package>`.
- A new package that needs an install script must be approved with `pnpm approve-builds`, and the resulting `allowBuilds` change in `pnpm-workspace.yaml` must be committed.

## Secrets and Testing

- Never commit `.env` files, API keys, tokens or WhatsApp session data.
- Every new environment variable is added to that app's `.env.example`.
- Use a local database and Redis. Never run migrations against a production database.
- Test with a WhatsApp number you own, and only message people who agreed to it.
