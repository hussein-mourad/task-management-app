# Task Management App

A full-stack task management application built with Express.js, React (TanStack Start), PostgreSQL, and Drizzle ORM.

## Architecture

```
task-management-app/
├── apps/
│   ├── backend/          — Express.js API server
│   │   ├── src/
│   │   │   ├── features/auth/      — Auth (register, login, JWT middleware)
│   │   │   ├── features/projects/  — Projects CRUD + member management
│   │   │   ├── features/tasks/     — Tasks CRUD + filtering
│   │   │   ├── middleware/errors.ts — Centralized error handler
│   │   │   ├── db/index.ts         — Drizzle ORM client
│   │   │   ├── lib/env.ts          — Env var validation (Zod)
│   │   │   ├── app.ts              — Express app assembly
│   │   │   └── index.ts            — Entry point
│   │   └── Dockerfile             — Container image
│   └── frontend/         — TanStack Start (React 19, Vite 8, Tailwind 4)
│       └── src/
│           ├── features/auth/      — AuthContext, login/register forms
│           ├── features/projects/  — Project list & form
│           ├── features/tasks/     — Task board (3 columns) & form
│           └── routes/             — File-based routes (TanStack Router)
├── compose.yml           — PostgreSQL + backend (Docker)
```

**Auth:** JWT-based with bcryptjs password hashing. Token stored in localStorage.

**Roles:** Two global roles — `admin` and `member`. Project-level roles (`admin`/`member`) control member management.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- [Docker](https://docker.com) (for PostgreSQL)

### Setup

```bash
# 1. Start PostgreSQL (and optionally the backend via Docker)
docker compose up -d db

# 2. Copy env and generate JWT secret
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env and set JWT_SECRET to a 32+ char string
# You can generate one with: openssl rand -base64 32

# 3. Install dependencies
bun install

# 4. Run database migrations
bun run --filter backend db:migrate

# 5. Seed test data
bun run --filter backend db:seed

# 6. Start both apps
bun run dev
```

Backend runs on `http://localhost:8000`, frontend on `http://localhost:3000`.

### Environment Variables

| Variable | Description | Default |
|---|---|---|---|
| `PORT` | Backend server port | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://postgres:postgres@localhost:5432/postgres` |
| `JWT_SECRET` | Secret for token signing (min 32 chars) | — |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `VITE_BACKEND_URL` | Backend URL (frontend) | `http://localhost:8000` |

## Test Credentials (all use `password123`)

| Role | Email |
|---|---|
| Admin | `admin@test.com` |
| Admin | `sarah@test.com` |
| Admin | `marcus@test.com` |
| Member | `alice@test.com` |
| Member | `bob@test.com` |
| Member | `emily@test.com` |
| Member | `james@test.com` |
| Member | `priya@test.com` |
| Member | `tom@test.com` |
| Member | `lisa@test.com` |

Run `bun run --filter backend db:seed` to create these accounts.

## API Documentation

### Authentication

```
POST /api/auth/register   — { email, password, name } → { user, token }
POST /api/auth/login      — { email, password } → { user, token }
GET  /api/auth/me         — [Auth] → { user }
```

### Projects (all require auth)

```
GET    /api/projects                         — List user's projects
POST   /api/projects                         — Create project
GET    /api/projects/:id                     — Get project details
PUT    /api/projects/:id                     — Update (project admin only)
DELETE /api/projects/:id                     — Delete (project admin only)
POST   /api/projects/:id/members             — Add member (project admin only)
DELETE /api/projects/:id/members/:userId     — Remove member (project admin only)
```

### Tasks (all require project membership)

```
GET    /api/projects/:id/tasks?status=&priority=&assignee=  — List with filters
POST   /api/projects/:id/tasks                              — Create task
GET    /api/projects/:id/tasks/:taskId                      — Get task
PUT    /api/projects/:id/tasks/:taskId                      — Update task
DELETE /api/projects/:id/tasks/:taskId                      — Delete task
```

**Task statuses:** `todo`, `in_progress`, `done`
**Task priorities:** `low`, `medium`, `high`, `critical`

All authenticated routes use `Authorization: Bearer <token>` header.

## Scripts

| Command | Action |
|---|---|
| `bun run dev` | Start both apps |
| `bun run dev:backend` | Backend only (watch mode) |
| `bun run dev:frontend` | Frontend only |
| `bun run test` | Run all tests |
| `bun run --filter backend test` | Backend tests only |
| `bun run --filter backend db:seed` | Seed test data |
| `bun run --filter backend db:migrate` | Run pending migrations |
| `bun run --filter frontend check` | Frontend lint + format check |
| `docker compose up -d` | Start PostgreSQL (and backend via Docker) |
| `docker compose up -d db` | Start PostgreSQL only |

## Testing

13 backend integration tests covering:
- Auth registration and login
- Auth guard (401 without token)
- Project CRUD
- Task CRUD with filtering
- Authorization (non-members blocked)

```bash
bun run --filter backend test
```

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT + bcryptjs + Zod |
| Testing | Vitest + Supertest |
| Frontend | TanStack Start (React 19, Vite 8, Tailwind 4, TanStack Router) |
| Lint/Format | Biome |