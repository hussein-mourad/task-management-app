## Context

The task board renders three columns (To Do, In Progress, Done) using a CSS grid. Each `TaskCard` has an inline `<Select>` dropdown to change status, which calls `PUT /api/projects/:id/tasks/:taskId`. The board uses React Query with automatic invalidation.

There is no drag-and-drop library installed. The columns are static — tasks are rendered by filtering the API response by status.

## Goals / Non-Goals

**Goals:**
- Users can drag a task card between columns to change its status
- Optimistic UI update so the card moves instantly before the API responds
- The inline status dropdown remains as an accessibility fallback
- Works on desktop (mouse) and touch devices
- Uses `@dnd-kit` (modern, maintained, tree-shakeable, works with React 19)

**Non-Goals:**
- Reordering tasks within a column (order is not a concept in the current schema)
- Cross-project drag-and-drop
- Animations beyond the built-in dnd-kit defaults
- Backend changes (existing API already supports status updates)

## Decisions

1. **@dnd-kit over react-beautiful-dnd / @hello-pangea/dnd** — `@dnd-kit` is actively maintained, works with React 19, supports both mouse and touch, and is tree-shakeable. `react-beautiful-dnd` is unmaintained. `@hello-pangea/dnd` is a fork that works but `@dnd-kit` has better TypeScript support and an active community.

2. **Single droppable per column** — Each column gets its own `useDroppable` container. The dragged task's `useDraggable` carries the task ID and source status. On drop, we read the destination column's status and call `updateTask`.

3. **No within-column sorting** — The schema has no `sort_order` or `position` column. Adding one would require a migration, backend endpoint changes, and significant complexity. The trade-off is accepted for now.

4. **Keep dropdown as fallback** — Users who prefer keyboard navigation or have accessibility needs can still use the existing Select component. The two approaches coexist; the dropdown stays on each card.

## Risks / Trade-offs

- **Optimistic update + API failure** → On error, revert the task to its original column and show a toast. React Query's `onError` rollback handles this.
- **Touch support** → `@dnd-kit` handles touch natively via `PointerSensor`, but long-press on mobile might conflict with scroll. Mitigation: configure activation constraint (`distance: 5`) to distinguish drag from scroll.
- **Column layout shift during drag** → The dragged card's original position might collapse. Mitigation: use `useSortable` or preserve column height with a placeholder element.
