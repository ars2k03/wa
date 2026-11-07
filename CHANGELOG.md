# Changelog

Notable changes to WA Gateway. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- MIT license and public repository files: README, contributing guide, code of conduct, security policy, support guide, issue and pull request templates, and code owners
- Turborepo pipeline and pnpm workspace

### Security

- API keys are stored as SHA-256 hashes and shown only once, when created
- Message logs reference keys by ID instead of storing the key

### Changed

- Merged the separate API and web repositories into one monorepo, keeping the history of both
- Moved the API to `apps/server` and the web app to `apps/web`
- Replaced npm with pnpm
- Upgraded dependencies, including Next.js 16.4.5, React 19.3.1, NestJS 12.4, TypeScript 6 and Vitest 5
