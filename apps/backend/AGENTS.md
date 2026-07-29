# Backend — `apps/backend`

This file replaces the auto-generated Bun boilerplate that was here before. The project requires Express.js (or NestJS), not `Bun.serve()`. See root `AGENTS.md` for full details.

## Quick reference

- Dev server: `bun run dev` (runs `bun --hot src/index.ts`)
- Tests: `vitest` (run via `bun run --filter backend test`)
- Drizzle CLI: `db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`
- Entrypoint: `src/index.ts`

## Dependencies

- `vitest` and `drizzle-kit` are needed but not yet in `devDependencies` — add them explicitly.