## Why

Project and task lists return every row in a single response with no ordering guarantees, which gets slow and unwieldy as data grows. Inline create forms (New Project, New Task) expand inline in the page, disrupting the layout. Pagination and dialog-based forms give a more professional, scalable UI.

## What Changes

- Add `page`/`limit` query params and `total` metadata to `GET /api/projects` and `GET /api/projects/:id/tasks`
- Add stable ordering (`createdAt DESC, id DESC`) so pagination is deterministic
- Keep response keys `tasks`/`projects` unchanged; add `page`, `limit`, `total` alongside them (non-breaking)
- Add a `Pagination` UI component and use it on the project list page
- The task board continues fetching all tasks (large default limit) so the kanban columns and drag-and-drop keep working
- Convert the inline New Task form into a `CreateTaskDialog`
- Convert the inline New Project form into a `CreateProjectDialog`
- Create a `apps/frontend/src/features/tasks/components/` directory to hold the extracted task dialog

## Capabilities

### New Capabilities
- `list-pagination`: Paginated, deterministically-ordered project and task list endpoints with pagination UI on the frontend
- `create-form-dialogs`: Create forms for projects and tasks presented in dialogs instead of inline cards

### Modified Capabilities

(no existing specs to modify)

## Impact

- Backend: `apps/backend/src/features/projects/projects.routes.ts`, `apps/backend/src/features/tasks/tasks.routes.ts` — pagination query parsing + count query
- Backend tests: `apps/backend/src/features/projects/projects.test.ts`, `apps/backend/src/features/tasks/tasks.test.ts` — may need updates for new response shape assertions
- Frontend: `apps/frontend/src/features/projects/project-list.tsx` — pagination UI, replace inline ProjectForm
- Frontend: `apps/frontend/src/features/tasks/task-board.tsx` — replace inline CreateTaskForm, update tasks query for limit
- Frontend new: `apps/frontend/src/components/ui/pagination.tsx`, `apps/frontend/src/features/projects/components/create-project-dialog.tsx`, `apps/frontend/src/features/tasks/components/create-task-dialog.tsx`
- Frontend API: `apps/frontend/src/features/projects/api.ts`, `apps/frontend/src/features/tasks/api.ts`, `apps/frontend/src/features/projects/hooks.ts`
