## 1. Backend: Security Middleware

- [x] 1.1 Install `helmet`, `cors`, `express-rate-limit`, `morgan` and their type packages
- [x] 1.2 Apply middleware in `app.ts` — helmet, cors (with FRONTEND_URL), morgan ("dev"), rate limiter (100/15min)

## 2. Frontend: Configurable API URL

- [x] 2.1 Switch `api.ts` base URL from hardcoded to `import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000"`

## 3. Seed Data

- [x] 3.1 Install `@faker-js/faker` in backend
- [x] 3.2 Rework `seed.ts` — 10 users (3 admins, 7 members, password `password123`), 50 projects per user (500 total), 50 tasks per project (25000 total) using faker for realistic data
- [x] 3.3 Update test login credentials in tests to `password123`

## 4. Docker Compose

- [x] 4.1 Move `compose.yml` to project root; add a backend service so `docker compose up` runs DB + backend

## 5. Documentation

- [x] 5.1 Write `README.md` at project root with setup, architecture, env vars, test credentials, scripts reference
- [x] 5.2 Update `.env.example` files to include all required variables

## 6. Verify

- [x] 6.1 Run `bun run --filter frontend check` — Biome passes
- [x] 6.2 Run `bun run --filter backend test` — all tests pass
- [x] 6.3 Run `bunx tsc --noEmit` in backend — no type errors
