## Context

The existing task board uses manual `useState` + `fetch()` for data fetching with no loading/error states. The backend already has `PUT /api/tasks/:id` and `DELETE /api/tasks/:id` but they're never called. `assignedTo` exists on the tasks schema but isn't validated against project membership. There's no way to list users or project members.

## Goals / Non-Goals

**Goals:**
- Backend `GET /api/users` (all users, no pagination needed yet)
- Backend `GET /api/projects/:id/members` (project members)
- Backend validation: `assignedTo` must be a member of the task's project
- Frontend edit task dialog (title, description, status, assignee) using RHF + Zod
- Frontend inline status change dropdown on task cards
- Frontend assignee dropdown in create/edit task forms
- Frontend task board refactored to use React Query (`useQuery`, `useMutation`)
- Frontend loading/error/empty states

**Non-Goals:**
- Member management (add/remove members) — deferred to next change
- Project editing/deletion — deferred to next change
- Pagination for user/member listing
- Drag-and-drop for task reordering

## Decisions

- **Design Decision: Reuse axios client for user/member APIs** — The existing `lib/api.ts` axios client with auth interceptors is used, same pattern as auth API modules.
- **Design Decision: Inline status dropdown on task card** — Each task card renders a `<select>` for status changes. On change, `useMutation` fires a `PATCH` (or `PUT`) to update the task and on success invalidates the query key. This avoids a dialog for simple status changes.
- **Design Decision: Edit dialog opens from task card button** — A "pencil" or "edit" icon on each card triggers a dialog pre-populated with task data. Submitting triggers a `useMutation`.
- **Design Decision: AssignedTo dropdown filters to project members** — The create/edit forms fetch members via `GET /api/projects/:id/members` and only show those options. The backend also validates membership.
- **Design Decision: Task board query keys** — Use `["tasks", projectId]` as the query key. Mutations invalidate this key on success.

## Risks / Trade-offs

- [Risk] Large team → many members in dropdown → Acceptable for now; no virtualization
- [Risk] Race condition on status change → Mutation with optimistic updates considered overengineering for now; simple invalidation is fine
- [Risk] No optimistic update → Slight flash on status change → Acceptable trade-off for simplicity
