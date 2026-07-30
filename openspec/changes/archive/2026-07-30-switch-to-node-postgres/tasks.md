## 1. Dependencies

- [x] 1.1 Install `pg` and `@types/pg`; uninstall `postgres`

## 2. Database Connection

- [x] 2.1 Update `src/lib/db.ts` — switch to `drizzle-orm/node-postgres` adapter with `pg.Pool`
- [x] 2.2 Add `pool.end()` call on server shutdown in `src/index.ts`

## 3. Verification

- [x] 3.1 Run backend tests to confirm all 13 tests still pass
- [x] 3.2 Run `bun run --filter frontend check` to confirm no lint regressions
