## Why

Manually changing task status via a dropdown select on each card is slow and unintuitive. Dragging tasks between columns provides a faster, more visual workflow that matches how users think about moving work forward.

## What Changes

- Install a drag-and-drop library (`@dnd-kit/core` + `@dnd-kit/sortable`)
- Convert the task board's static column layout into droppable zones
- Make each `TaskCard` draggable so users can move it between columns
- On drop, call the existing `PUT /api/projects/:id/tasks/:taskId` endpoint to update the task's status
- Keep the inline status dropdown as an alternative for accessibility
- Add optimistic updates so the UI feels instant

## Capabilities

### New Capabilities
- `task-board-dnd`: Drag-and-drop for reordering tasks between status columns on the task board

### Modified Capabilities

(no existing specs to modify)

## Impact

- Frontend: `apps/frontend/src/features/tasks/task-board.tsx` — TaskBoard layout, TaskCard component
- Frontend: `apps/frontend/package.json` — new `@dnd-kit/core` and `@dnd-kit/sortable` dependencies
- Backend: no changes needed (existing `PUT /api/projects/:id/tasks/:taskId` already handles status updates)
