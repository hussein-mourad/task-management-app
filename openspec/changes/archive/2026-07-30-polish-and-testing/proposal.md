## Why

The core features are complete, but the app needs production hardening, better documentation, and improved testing/seed data before submission.

## What Changes

- Add security middleware: helmet, cors, rate limiting, morgan logging
- Switch frontend API base URL from hardcoded to `VITE_BACKEND_URL` env var
- Add sample tasks to seed data
- Write comprehensive README with setup, architecture, env vars, test credentials
- Move Docker Compose to project root for one-command setup

## Capabilities

### New Capabilities
- `backend-security`: Helmet, CORS, rate limiting, request logging middleware
- `frontend-config`: Environment-based API URL configuration

### Modified Capabilities
*(none)*

## Impact

- **Backend**: New dependencies (helmet, cors, express-rate-limit, morgan); middleware applied in app.ts
- **Frontend**: Single-line change in api.ts to use env var
- **Seed**: Tasks added to seed script
- **Docs**: New README.md at project root
- **Infra**: Docker Compose moved to root
