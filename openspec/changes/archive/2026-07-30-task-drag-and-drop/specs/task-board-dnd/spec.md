## ADDED Requirements

### Requirement: Drag task between columns
The system SHALL allow users to drag a task card from one status column to another on the task board.

#### Scenario: Drag task from To Do to In Progress
- **WHEN** user drags a "To Do" task card onto the "In Progress" column
- **THEN** the task SHALL move to the "In Progress" column immediately (optimistic update)
- **THEN** the system SHALL call `PUT /api/projects/:id/tasks/:taskId` with `{ status: "in_progress" }`
- **THEN** the task SHALL display its new status in the updated column

#### Scenario: Drag task from In Progress to Done
- **WHEN** user drags an "In Progress" task card onto the "Done" column
- **THEN** the task SHALL move to the "Done" column immediately (optimistic update)
- **THEN** the system SHALL call `PUT /api/projects/:id/tasks/:taskId` with `{ status: "done" }`

#### Scenario: Drag back to original column cancels no-op
- **WHEN** user drags a task card back to its original column
- **THEN** the task SHALL remain in its column
- **THEN** no API call SHALL be made

### Requirement: Drag visual feedback
The system SHALL provide visual feedback during a drag operation.

#### Scenario: Card becomes semi-transparent while dragging
- **WHEN** user starts dragging a task card
- **THEN** the dragged card SHALL appear semi-transparent at the cursor position
- **THEN** the card's original position SHALL show a placeholder or maintain spacing

#### Scenario: Drop target highlights on hover
- **WHEN** user drags a card over a droppable column
- **THEN** the column SHALL show a visual highlight (e.g., border or background change) to indicate it is a valid drop target

### Requirement: API failure rollback
The system SHALL handle API failures gracefully during drag-and-drop.

#### Scenario: API error during drag
- **WHEN** the `PUT` API call fails after a drag-and-drop
- **THEN** the task SHALL return to its original column
- **THEN** an error notification SHALL be displayed

### Requirement: Accessibility fallback
The system SHALL retain the existing status dropdown as an alternative to drag-and-drop.

#### Scenario: Status dropdown still functional
- **WHEN** user changes task status via the inline `<Select>` dropdown
- **THEN** the task SHALL update its status as before
- **THEN** the task SHALL move to the corresponding column
