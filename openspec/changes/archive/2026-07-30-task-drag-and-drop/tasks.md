## 1. Dependency Installation

- [x] 1.1 Install `@dnd-kit/core` and `@dnd-kit/sortable` in frontend

## 2. Drag-and-Drop Implementation

- [x] 2.1 Replace static column container with `DndContext` + droppable column wrappers
- [x] 2.2 Make `TaskCard` draggable with `useDraggable` carrying task id and source status
- [x] 2.3 Implement `onDragEnd` handler to call `updateTask` mutation with new status (no-op if same column)
- [x] 2.4 Add optimistic update with rollback on API error
- [x] 2.5 Add visual feedback — dragged card opacity, drop target highlight, placeholder during drag

## 3. Verification

- [x] 3.1 Run `bun run --filter frontend check` — Biome passes
- [x] 3.2 Run `bun run --filter backend test` — all tests pass
- [x] 3.3 Verify drag between all three column pairs works manually
- [x] 3.4 Verify inline status dropdown still works alongside drag-and-drop
