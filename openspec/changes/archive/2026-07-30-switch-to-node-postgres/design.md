## Context

The backend uses Drizzle ORM with the `postgres.js` adapter (`drizzle-orm/postgres-js`). This is a valid setup but `postgres.js` has a different connection model (tagged template queries, no built-in pool) compared to the more standard `node-postgres` (`pg`) driver. The project already uses Express.js conventions; switching to `pg` aligns with that traditional stack.

## Goals / Non-Goals

**Goals:**
- Replace `postgres.js` with `node-postgres` (`pg`) as the database driver
- Use `pg.Pool` for connection pooling
- Keep all Drizzle ORM queries, schema definitions, and migrations unchanged

**Non-Goals:**
- No query or schema changes
- No Drizzle Kit config changes
- No migration regeneration

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Driver | `pg` + `@types/pg` | `pg` is the de facto standard Node.js Postgres driver with the largest ecosystem and community support |
| Drizzle adapter | `drizzle-orm/node-postgres` | First-party adapter, mirrors the `postgres-js` adapter API exactly — a drop-in swap |
| Pool vs Client | `pg.Pool` | Pool provides built-in connection pooling, better for production HTTP servers; Drizzle manages checkout/return transparently |

## Risks / Trade-offs

- **Low risk**: The `drizzle-orm/node-postgres` and `drizzle-orm/postgres-js` adapters expose identical APIs (`db` object). No query code needs to change.
- **Testing**: Pool needs to be closed in test teardown (`afterAll`) to avoid hanging processes. Add a `pool.end()` call on shutdown.
