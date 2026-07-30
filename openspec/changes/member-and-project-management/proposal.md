## Why

The project detail page currently only shows the task board with no way to manage the project itself or its members. Users need a dedicated project management area to view project info, edit/delete projects, and manage members (add/remove).

## What Changes

- Extend the project detail page (`/projects/$projectId`) with a header showing project info (name, description, role badge) and management actions
- Add a members section showing all project members with their roles
- Add member management UI — add member dialog (search by user email), remove member button with confirmation
- Add project edit dialog (update name/description)
- Add project delete button with confirmation dialog
- Backend: duplicate member check on `POST /:id/members` (currently inserts duplicate without error)
- Backend: prevent removing the last admin from a project
- Refactor project list page to React Query (replaces manual fetch/state)

## Capabilities

### New Capabilities
- `project-detail-ui`: Project detail page showing project information, management actions (edit/delete), and member list with roles
- `member-management-ui`: Add members by email/ID with validation, remove members with role-based guard

### Modified Capabilities
*(none)*

## Impact

- **Frontend**: New components for project detail, member management; extends existing routes
- **Backend**: Minor validation additions (duplicate member check, last admin guard) to existing routes
- **No breaking changes** — existing APIs remain unchanged
