# task-management-app

## Repo

- Bun workspace monorepo — `apps/backend`, `apps/frontend`
- Use `bun install`, `bun run <script>`, `bunx`. Never npm/yarn/pnpm.
- Root scripts run filtered commands across both apps.

## Backend (`apps/backend`)

- Use Express.js (or NestJS), NOT `Bun.serve()`. The existing `apps/backend/AGENTS.md` is stale boilerplate.
- `vitest` and `drizzle-kit` are referenced in scripts but **not yet installed**. Add them to `devDependencies` explicitly.
- Drizzle scripts: `db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`.
- Tests: `bun run --filter backend test` (vitest).

## Frontend (`apps/frontend`)

- TanStack Start (Vite 8, React 19, Tailwind CSS 4, TanStack Router).
- Dev server: `vite dev --port 3000` (not default 5173).
- Routes: file-based in `src/routes/`. After adding routes, run `bun run --filter frontend generate-routes` to regenerate `src/routeTree.gen.ts`.
- Lint/format: Biome — `bun run --filter frontend lint`, `bun run --filter frontend format`, `bun run --filter frontend check`.
- Biome config: tab indentation, double quotes, excludes `routeTree.gen.ts` and `styles.css`.

## Developer commands

| Command | Action |
|---|---|
| `bun run dev` | Run both apps in parallel |
| `bun run dev:backend` | Backend dev server only |
| `bun run dev:frontend` | Frontend dev server only |
| `bun run test` | Run all tests (backend then frontend) |
| `bun run --filter backend test` | Backend tests only (vitest) |
| `bun run --filter frontend check` | Full Biome lint+format check |
| `bun run --filter frontend generate-routes` | Regenerate route tree |

## Workflow

- Propose changes: `/opsx-propose <change-name>`
- Implement changes: `/opsx-apply <change-name>`
- Spec/docs for this build: `docs/TASK.md` outlines all functional requirements.