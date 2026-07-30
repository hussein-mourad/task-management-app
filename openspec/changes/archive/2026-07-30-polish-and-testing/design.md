## Context

The backend currently has no security middleware beyond JWT auth. The frontend hardcodes `http://localhost:8000` as the API base URL. The seed script creates users and a project but no tasks. There is no project-level README.

## Goals / Non-Goals

**Goals:**
- Apply helmet (security headers), CORS (configured origins), rate limiting (100 req/15min), and morgan (dev logging)
- Switch frontend API base URL to `import.meta.env.VITE_BACKEND_URL`
- Add sample tasks with varying priorities/statuses to seed data
- Write a complete README with setup, architecture, env vars, test credentials

**Non-Goals:**
- Swagger/OpenAPI docs (nice-to-have, not in scope)
- WebSocket or real-time features
- Comprehensive test coverage increase (just verify existing tests)

## Decisions

- **helmet + cors middleware order**: helmet first (security headers), then cors (cross-origin), then morgan (logging), then rate limiter before routes. Standard order.
- **Rate limiter**: Use `express-rate-limit` with a global limiter (100 requests per 15 min window). Applied to all `/api/*` routes.
- **Seed data**: Create 10 users (3 admins, 7 members) with realistic faker names/emails, all using password "password123". Create 50 projects per user (500 total). Add each user as admin of their own projects and member of others. Create 50 tasks per project (25000 total) with realistic titles, descriptions, varied statuses/priorities/dates using faker.
- **Docker Compose**: Move to project root for unified startup. Add backend service so `docker compose up` starts both DB and backend.
- **README structure**: Title, stack, prereqs, quick start, env vars, architecture, API overview, test credentials, scripts reference.
- **Faker**: Use `@faker-js/faker` for generating realistic seed data (names, emails, project names, task titles, descriptions).

## Risks / Trade-offs

- **Rate limiter on dev**: Might hit limits during development. → Increase limit or add NODE_ENV check to skip in dev. But keeping it on is fine for production-minded testing.
- **Docker Compose at root**: The root package.json scripts reference `apps/backend/compose.yml`. Need to update the reference or keep it compatible.
