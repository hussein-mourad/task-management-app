## Why

The project currently uses `postgres.js` as the database driver for Drizzle ORM. The `postgres.js` package has a different runtime API surface than the more widely adopted `node-postgres` (`pg`) driver. Switching to `pg` provides better ecosystem compatibility, wider community support, and more predictable connection pooling behavior for production deployments.

## What Changes

- Replace `postgres` dependency with `pg` + `@types/pg`
- Update Drizzle adapter from `drizzle-orm/postgres-js` to `drizzle-orm/node-postgres`
- Update `src/lib/db.ts` to use `pg` Pool and the `node-postgres` drizzle adapter
- No schema, migration, or query changes — this is purely a driver swap at the connection layer

## Capabilities

### New Capabilities
- *(none — this is a dependency/configuration change, not a new feature)*

### Modified Capabilities
- *(none — no spec-level behavior changes)*

## Impact

- **Dependencies**: Remove `postgres`, add `pg` + `@types/pg`
- **File changed**: `src/lib/db.ts` — Drizzle adapter and client instantiation
- **Package manager**: Update `package.json` and lockfile
- **No impact**: All schema definitions, queries, routes, tests, and Drizzle Kit config remain untouched
