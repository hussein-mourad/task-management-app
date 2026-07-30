## Why

Tasks on the board are read-only — users cannot edit task details, change status, or assign tasks to team members. The backend has `PUT`/`DELETE` endpoints but the frontend never calls them. There's also no way to list users or project members, making assignment and member management impossible in the UI.

## What Changes

- Add `GET /api/users` endpoint to list all users for assignment.
- Add `GET /api/projects/:id/members` endpoint to list project members.
- Validate `assignedTo` field in task create/update — only project members allowed.
- Add task editing dialog in the frontend with React Hook Form + Zod.
- Add inline status change (dropdown) on task cards.
- Add assignee dropdown to task create and edit forms.
- Refactor task board to use React Query (`useQuery`, `useMutation`) for all data fetching.
- Add loading/empty/error states to the task board.

## Capabilities

### New Capabilities
- `user-and-member-listing`: Backend endpoints to list users and project members, with frontend hooks and UI for selection.
- `task-editing-ui`: Frontend edit dialog, inline status change, and assignee dropdown using React Hook Form + React Query.

### Modified Capabilities
- *(none — first capability specs in this project)*

## Impact

- **Backend**: New routes in `users.routes.ts` and `projects.routes.ts`. Modified validation in `tasks.routes.ts`.
- **Frontend**: `features/tasks/task-board.tsx` rewritten to use React Query + RHF. New `EditTaskDialog` component. New member/user API hooks.
- **Deleted**: Raw `fetch()` calls and manual `useState`/`useEffect` data fetching in task-board.tsx (replaced by React Query).
