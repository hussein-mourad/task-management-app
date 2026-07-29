# Project Plan — Task Management App

## Tech Stack

| Layer           | Choice                                                         |
| --------------- | -------------------------------------------------------------- |
| **Backend**     | Express.js + TypeScript                                        |
| **Database**    | PostgreSQL 16 (Docker Compose)                                 |
| **ORM**         | Drizzle (schema, migrations, queries)                          |
| **Auth**        | Manual JWT + bcryptjs + Zod                                    |
| **Validation**  | Zod (request bodies, env vars)                                 |
| **Testing**     | Vitest (backend)                                               |
| **Frontend**    | TanStack Start (React 19, Vite 8, Tailwind 4, TanStack Router) |
| **Lint/format** | Biome (frontend only)                                          |
| **Runtime**     | Bun (package manager + dev runner)                             |

## Project Structure

```
task-management-app/
├── docker-compose.yml
├── AGENTS.md
├── docs/
│   ├── TASK.md
│   └── PLAN.md
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts                — listen()
│   │   │   ├── app.ts                  — Express assembly (middleware, routes)
│   │   │   ├── config.ts               — env parsing via Zod
│   │   │   ├── lib/
│   │   │   │   └── db.ts               — Drizzle client
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.schema.ts     — Drizzle users table
│   │   │   │   │   ├── auth.service.ts    — hash, sign, verify
│   │   │   │   │   ├── auth.middleware.ts — requireAuth guard
│   │   │   │   │   ├── auth.validator.ts  — Zod schemas
│   │   │   │   │   ├── auth.routes.ts     — /register, /login, /me
│   │   │   │   │   └── auth.test.ts
│   │   │   │   ├── projects/
│   │   │   │   │   ├── projects.schema.ts    — projects + project_members
│   │   │   │   │   ├── projects.service.ts   — business logic + authz
│   │   │   │   │   ├── projects.validator.ts
│   │   │   │   │   ├── projects.routes.ts    — CRUD + members
│   │   │   │   │   └── projects.test.ts
│   │   │   │   └── tasks/
│   │   │   │       ├── tasks.schema.ts
│   │   │   │       ├── tasks.service.ts
│   │   │   │       ├── tasks.validator.ts
│   │   │   │       ├── tasks.routes.ts       — CRUD + filtering
│   │   │   │       └── tasks.test.ts
│   │   │   ├── middleware/
│   │   │   │   └── errors.ts            — global error handler
│   │   │   └── db/
│   │   │       ├── index.ts             — pool + drizzle init
│   │   │       └── seed.ts              — admin + sample data
│   │   ├── drizzle.config.ts
│   │   ├── .env.example
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── lib/
│       │   │   └── api.ts              — JWT fetch wrapper
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   │   ├── auth-context.tsx — AuthProvider + useAuth
│       │   │   │   ├── login-form.tsx
│       │   │   │   └── register-form.tsx
│       │   │   ├── projects/
│       │   │   │   ├── project-list.tsx
│       │   │   │   ├── project-card.tsx
│       │   │   │   └── project-form.tsx
│       │   │   └── tasks/
│       │   │       ├── task-board.tsx   — 3-column board
│       │   │       ├── task-card.tsx
│       │   │       └── task-form.tsx
│       │   └── routes/
│       │       ├── __root.tsx
│       │       ├── index.tsx
│       │       ├── login.tsx
│       │       ├── register.tsx
│       │       ├── projects/
│       │       │   ├── index.tsx
│       │       │   └── $projectId/
│       │       │       ├── index.tsx
│       │       │       └── tasks/
│       │       │           ├── new.tsx
│       │       │           └── $taskId.edit.tsx
│       │   └── ...
│       └── package.json
```

## Database Schema (Drizzle)

```
users
  id            text PK            — cuid2
  email         text NOT NULL UNIQUE
  password_hash text NOT NULL
  name          text NOT NULL
  role          text NOT NULL DEFAULT 'member'   — 'admin' | 'member'
  created_at    timestamp DEFAULT now()
  updated_at    timestamp DEFAULT now()

projects
  id            text PK
  name          text NOT NULL
  description   text
  created_by    text NOT NULL FK → users(id)
  created_at    timestamp DEFAULT now()
  updated_at    timestamp DEFAULT now()

project_members
  project_id    text NOT NULL FK → projects(id) ON DELETE CASCADE
  user_id       text NOT NULL FK → users(id) ON DELETE CASCADE
  role          text NOT NULL DEFAULT 'member'   — 'admin' | 'member'
  joined_at     timestamp DEFAULT now()
  PK (project_id, user_id)

tasks
  id            text PK
  project_id    text NOT NULL FK → projects(id) ON DELETE CASCADE
  title         text NOT NULL
  description   text
  status        text NOT NULL DEFAULT 'todo'     — 'todo' | 'in_progress' | 'done'
  priority      text NOT NULL DEFAULT 'medium'   — 'low' | 'medium' | 'high' | 'critical'
  due_date      timestamp
  created_by    text NOT NULL FK → users(id)
  assigned_to   text FK → users(id)
  created_at    timestamp DEFAULT now()
  updated_at    timestamp DEFAULT now()
```

## API Endpoints

### Auth (public)

```
POST /api/auth/register    — { email, password, name } → { user, token }
POST /api/auth/login       — { email, password } → { user, token }
```

### Auth (protected)

```
GET  /api/auth/me          — → { user }
```

### Projects (all protected)

```
GET    /api/projects                    — list user's projects
POST   /api/projects                    — create project
GET    /api/projects/:id                — get project details
PUT    /api/projects/:id                — update (project admin only)
DELETE /api/projects/:id                — delete (project admin only)
POST   /api/projects/:id/members        — add member (project admin only)
DELETE /api/projects/:id/members/:uid   — remove member (project admin only)
```

### Tasks (all protected + membership required)

```
GET    /api/projects/:id/tasks?status=&priority=&assignee=  — list with filters
POST   /api/projects/:id/tasks                               — create
GET    /api/projects/:id/tasks/:taskId                       — get
PUT    /api/projects/:id/tasks/:taskId                       — update
DELETE /api/projects/:id/tasks/:taskId                       — delete
```

## Authorization Rules

| Action                   | Role check                                            |
| ------------------------ | ----------------------------------------------------- |
| Register/login           | Public                                                |
| View project             | Must be project member or admin globally              |
| Update/delete project    | Must be project admin                                 |
| Add/remove members       | Must be project admin                                 |
| Create/read/update tasks | Must be project member                                |
| Delete task              | Must be project member (creator or project admin)     |
| Seed admin account       | global `role = 'admin'` bypasses project-level checks |

## Frontend Auth Flow

- JWT stored in `localStorage`
- `AuthContext` (React context) provides `user`, `token`, `login()`, `logout()`, `isLoading`
- `api.ts` fetch wrapper reads token from context/localStorage, attaches `Authorization: Bearer`
- On 401 response → clear auth state, redirect to `/login`
- Routes redirect: if no token → `/login`, if token → `/projects`

## Testing Plan (minimum 5 backend tests)

1. **Auth register** — creates user, returns token + user object
2. **Auth login** — correct credentials returns token, wrong returns 401
3. **Project auth guard** — `GET /api/projects` returns 401 without token
4. **Task authorization** — non-member gets 403 creating a task
5. **Task filtering** — `GET /api/projects/:id/tasks?status=todo` returns filtered list

## Implementation Order

| #   | Step                                                          | Est.     |
| --- | ------------------------------------------------------------- | -------- |
| 1   | Docker Compose — PostgreSQL service                           | 0.5h     |
| 2   | Backend deps — install all dependencies                       | 0.5h     |
| 3   | Drizzle config + schema (all 4 tables)                        | 1h       |
| 4   | Config + error middleware                                     | 0.5h     |
| 5   | Auth feature — schema, service, validator, routes, middleware | 1.5h     |
| 6   | Projects feature — schema, service, validator, routes         | 1.5h     |
| 7   | Tasks feature — schema, service, validator, routes            | 1.5h     |
| 8   | App assembly + seed script                                    | 0.5h     |
| 9   | Backend tests (5+)                                            | 1h       |
| 10  | Frontend auth — context, login/register pages                 | 1h       |
| 11  | Frontend projects — list, create/edit                         | 1h       |
| 12  | Frontend task board — board + form                            | 1.5h     |
| 13  | Polish — UX states, responsive, README, .env.example          | 1h       |
| --  | **Total**                                                     | **~12h** |

## Environment Variables

```bash
# apps/backend/.env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
JWT_SECRET=<generate with: openssl rand -base64 32>
PORT=3000
```

## Docker Compose

```yaml
services:
  db:
    image: postgres:17-10-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - db:/var/lib/postgresql/data

volumes:
  db:
```

## Bonuses (time permitting)

1. Pagination, sorting, and search on tasks endpoint
2. Docker Compose including backend service
3. API documentation (Swagger/OpenAPI)
4. Audit log for task status changes
