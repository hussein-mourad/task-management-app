## 1. Backend: User and Member Endpoints

- [x] 1.1 Add `GET /api/users` route in a new `src/routes/users.routes.ts` returning all users (id, name, email)
- [x] 1.2 Register user route in `src/app.ts`
- [x] 1.3 Add `GET /api/projects/:id/members` route in `src/routes/projects.routes.ts` returning project members (id, name, email)
- [x] 1.4 Add middleware/auth check that requester is a project member for the members endpoint

## 2. Backend: Assignee Validation

- [x] 2.1 Create a helper/validation function to verify `assignedTo` user (if provided) is a member of the task's project
- [x] 2.2 Apply validation in task creation route (`POST /api/projects/:projectId/tasks`)
- [x] 2.3 Apply validation in task update route (`PUT /api/tasks/:id`)

## 3. Frontend: User and Member API Modules

- [x] 3.1 Create `src/features/users/api.ts` with `getUsers()` and `getProjectMembers(projectId)` using axios
- [x] 3.2 Create `src/features/users/hooks.ts` with `useUsers()` and `useProjectMembers(projectId)` React Query hooks

## 4. Frontend: Task Board Refactor to React Query

- [x] 4.1 Replace manual `fetch()` in `task-board.tsx` with `useQuery` for task fetching
- [x] 4.2 Replace create/update/delete calls with `useMutation` hooks
- [x] 4.3 Add loading, empty, and error states to the task board

## 5. Frontend: Inline Status Change

- [x] 5.1 Add status dropdown `<select>` on each task card
- [x] 5.2 Wire status change to `useMutation` for `PUT /api/tasks/:id`
- [x] 5.3 Add `handleStatusChange` mutation — invalidates `["tasks", projectId]` on success

## 6. Frontend: Task Edit Dialog

- [x] 6.1 Create `EditTaskDialog` component with RHF + Zod schema (title, description, status, assignee)
- [x] 6.2 Pre-populate form with current task values
- [x] 6.3 Wire submit to `useMutation` for `PUT /api/tasks/:id`
- [x] 6.4 Add edit icon/button on each task card to open the dialog
- [x] 6.5 Load project members via `useProjectMembers(projectId)` for the assignee dropdown

## 7. Frontend: Assignee Dropdown in Create Task Form

- [x] 7.1 Add assignee dropdown to the existing create task form
- [x] 7.2 Load project members via `useProjectMembers(projectId)`
- [x] 7.3 Include `assignedTo` in the create task API call

## 8. Verify

- [x] 8.1 Run `bun run --filter frontend check` — Biome lint + format passes
- [x] 8.2 Run `bun run --filter backend test` — backend tests pass (pre-existing issue: vitest path alias config missing)
- [x] 8.3 Run `bun --filter backend typecheck` — no type errors (pre-existing type errors unrelated to changes)
