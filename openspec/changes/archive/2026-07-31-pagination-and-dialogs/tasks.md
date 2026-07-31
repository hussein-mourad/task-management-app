## 1. Backend: Pagination

- [x] 1.1 Add `page`/`limit` query parsing + count query + `{ projects, page, limit, total }` response to `GET /api/projects` with `createdAt DESC, id DESC` ordering
- [x] 1.2 Add `page`/`limit` query parsing + count query + `{ tasks, page, limit, total }` response to `GET /api/projects/:id/tasks` with `createdAt DESC, id DESC` ordering
- [x] 1.3 Update backend tests to assert pagination metadata and ordering

## 2. Frontend: Pagination

- [x] 2.1 Update `listProjects` API + `useProjects` hook to accept and pass `page`/`limit`, including `total` in the return type
- [x] 2.2 Create `Pagination` UI component in `components/ui/pagination.tsx`
- [x] 2.3 Add pagination state and controls to `project-list.tsx`
- [x] 2.4 Update `listTasks` API to accept `page`/`limit` and have the task board request a large `limit` to keep all tasks loaded

## 3. Frontend: Dialog Forms

- [x] 3.1 Extract `CreateTaskForm` into `CreateTaskDialog` in `features/tasks/components/` following the `EditTaskDialog` controlled pattern; update task board to render the dialog
- [x] 3.2 Extract `ProjectForm` into `CreateProjectDialog` in `features/projects/components/`; update project list to render the dialog

## 4. Verification

- [x] 4.1 Run `bun run --filter frontend check` — Biome passes
- [x] 4.2 Run `bun run --filter backend test` — all tests pass
- [x] 4.3 Run `bunx tsc --noEmit` in backend — no type errors
