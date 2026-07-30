## 1. Backend: Validation & Cascade

- [x] 1.1 Add duplicate member check in `POST /:id/members` — query existing members before insert, return 409 if already a member
- [x] 1.2 Add last-admin guard in `DELETE /:id/members/:userId` — count remaining admins, reject if removing the last admin
- [x] 1.3 Fix project delete cascade — delete project_members and tasks before deleting the project row

## 2. Frontend: API & Hooks

- [x] 2.1 Add `addMember(projectId, userId)` and `removeMember(projectId, userId)` to `features/projects/api.ts`
- [x] 2.2 Create `useProject(projectId)` query hook in `features/projects/hooks.ts`
- [x] 2.3 Create `useAddMember` and `useRemoveMember` mutation hooks
- [x] 2.4 Create `useUpdateProject` and `useDeleteProject` mutation hooks
- [x] 2.5 Refactor `project-list.tsx` from manual `useState`/`useEffect` to `useQuery` + `useMutation`

## 3. Frontend: Project Detail Page

- [x] 3.1 Extend `routes/projects/$projectId/index.tsx` — add project header showing name, description, and current user's role badge
- [x] 3.2 Add `EditProjectDialog` component (RHF + Zod) for updating name/description
- [x] 3.3 Add project delete button with confirmation dialog
- [x] 3.4 Add member list section below the task board showing all members with roles
- [x] 3.5 Add `AddMemberDialog` component (user select dropdown + submit)
- [x] 3.6 Add remove member button on each member row with confirmation

## 4. Verify

- [x] 4.1 Run `bun run --filter frontend check` — Biome lint + format passes
- [x] 4.2 Run `bun run --filter backend test` — all tests pass
- [x] 4.3 Run `bunx tsc --noEmit` — no type errors
