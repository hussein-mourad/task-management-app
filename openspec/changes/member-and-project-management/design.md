## Context

The project detail page at `/projects/$projectId` currently renders only the `TaskBoard` component. The project list page at `/projects` uses manual `useState`/`useEffect` pattern for data fetching. Backend routes for project CRUD and member management already exist (`PUT /:id`, `DELETE /:id`, `POST /:id/members`, `DELETE /:id/members/:userId`).

## Goals / Non-Goals

**Goals:**
- Display project name, description, and user's role on the project detail page
- Allow admin users to edit project name/description and delete the project
- Add a member list section showing all members with their roles
- Allow admin users to add members (by selecting from registered users) and remove members
- Prevent duplicate member inserts and removal of the last admin
- Refactor project list to React Query for consistency

**Non-Goals:**
- Role management (changing member roles) — not required
- Pagination or search for members/users list
- Permission levels beyond admin/member

## Decisions

- **Extend existing route, don't create new pages**: The project detail page (`$projectId/index.tsx`) will be extended with a top section for project info and member management. The task board stays below. No new tabs/routes needed.
- **Dialogs for create/edit/delete**: Use existing `Dialog` component patterns (same as `EditTaskDialog`) for add member, edit project, delete confirmation. Inline forms avoided for clean UX.
- **React Query for all server state**: `useQuery` for project details, members list; `useMutation` for create/update/delete. Project list refactored away from manual fetch.
- **Backend validation in existing route handlers**: No new routes — just add duplicate check (`eq` on `projectId` + `userId`) before insert, and last-admin check (count remaining admins before delete).
- **Fallthrough delete**: Deleting a project cascades (deletes members + tasks via DB foreign keys or manually). Currently only the project row is deleted — need to clean up members and tasks too.

## Risks / Trade-offs

- **Project delete cascading**: If foreign keys exist with RESTRICT, deleting a project will fail. Need to delete project_members and tasks first. → Delete members and tasks before deleting the project.
- **Getting all users for add-member dropdown**: `GET /api/users` returns every user — fine for small teams. No pagination concern for now.
