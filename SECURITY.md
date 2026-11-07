# Security Policy

WA Gateway handles WhatsApp session credentials, API keys and phone numbers, so security reports are treated as a priority.

## Reporting a Vulnerability

Do not open a public issue for a security problem.

Report it privately through [GitHub's vulnerability reporting](https://github.com/ars2k03/whatsapp/security/advisories/new). Include:

- What the issue is and where it occurs
- Steps to reproduce it
- The impact you expect

A leaked secret should be reported immediately so it can be rotated.

## Scope

This policy covers the code in this repository and the service running at `wa.ars2k03.tech`.

Only test against accounts, numbers and data you own. Do not access other users' data, send messages to people who have not agreed to it, disrupt the service or run automated attacks against production.

Restrictions that WhatsApp places on a linked number are not security vulnerabilities in this project.

## Supported Versions

Only the latest code on `main` receives security fixes.

## Leaked Secrets

If a secret (`JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`, Gmail OAuth credentials or a gateway API key) is committed or shared by mistake, rotate it at the provider. Removing it from Git history is not enough.

Anyone with access to the Redis instance can read WhatsApp session credentials, so keep it private and require authentication.
