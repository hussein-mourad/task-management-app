## Context

`GET /api/projects` and `GET /api/projects/:id/tasks` return every row unfiltered by count, with no stable ordering for tasks. The frontend has two inline create forms (New Task in `task-board.tsx`, New Project in `project-list.tsx`) that expand as cards mid-page. Existing dialogs (`EditProjectDialog`, `EditTaskDialog`) already establish the dialog pattern with controlled `open`/`onOpenChange` props. There is no pagination UI component.

The kanban task board fetches all tasks in one query and splits them by status client-side, and the drag-and-drop optimistic updates operate on that full list.

## Goals / Non-Goals

**Goals:**
- Paginate project and task list API responses with `page`/`limit` params and `total` metadata
- Deterministic ordering so pages don't shift between requests
- Pagination UI on the project list page
- Convert inline create forms to dialogs, matching the existing dialog pattern
- Keep the task board fully functional (all tasks visible, drag-and-drop intact)

**Non-Goals:**
- Per-column pagination or "load more" inside the task board
- Server-side search or sorting (listed as a separate bonus in `docs/TASK.md`)
- Cursor-based pagination
- Paginating members, users, or other endpoints

## Decisions

1. **Offset pagination (`page`/`limit`) over cursor-based** — The dataset is small and lists are ordered by `createdAt`, where offset pagination is simple to implement and consume. Defaults: `page=1`, `limit=20` for projects; `limit` for tasks defaults to `50` but the frontend board requests a large limit to fetch all tasks.

2. **Response shape adds metadata without breaking existing keys** — Responses become `{ projects, page, limit, total }` and `{ tasks, page, limit, total }`. Existing `projects`/`tasks` array keys are preserved so current backend tests and consumers keep working.

3. **Stable ordering `createdAt DESC, id DESC`** — Pagination requires a deterministic order. `id` (cuid2) acts as a tiebreaker when timestamps collide. The projects endpoint already orders by `createdAt`; tasks gain an explicit `orderBy`.

4. **Task board requests all tasks via a large `limit`** — The kanban board needs every task across all three columns for filtering and drag-and-drop, and its optimistic updates assume a full list. The board passes `limit: 500`; pagination UI is not added to the board. Pagination is thus fully exercised on the project list and available in the API for tasks.

5. **Extract create forms into dialog components following the existing pattern** — `CreateTaskDialog` lives in `features/tasks/components/` (new dir), `CreateProjectDialog` lives in `features/projects/components/`, both controlled via `open`/`onOpenChange` like the existing edit dialogs. The task form already uses React Hook Form + Zod and keeps its logic; the project form's controlled state is wrapped unchanged.

6. **`Pagination` component in `components/ui/`** — Prev/next buttons plus page numbers, matching the existing shadcn-style primitive set.

## Risks / Trade-offs

- **Large task limit could still truncate very busy projects** → The board's `limit: 500` is far above the seeded 50 tasks/project. Acceptable for now; a future "load more" can replace it.
- **Offset pagination can skip/duplicate rows if new items are inserted during paging** → Accepted for this scale; ordering by `createdAt DESC, id DESC` minimizes drift.
- **Dialogs change keyboard/focus flow** → Follow the existing `EditProjectDialog`/`EditTaskDialog` usage which already handles focus trapping via Base UI.
- **Project form is plain controlled state, not RHF** → Kept unchanged to minimize churn; converting to RHF is possible later.
