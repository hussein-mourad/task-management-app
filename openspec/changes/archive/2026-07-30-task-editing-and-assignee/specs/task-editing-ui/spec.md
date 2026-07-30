## ADDED Requirements

### Requirement: Task edit dialog
The system SHALL provide an edit dialog for tasks, pre-populated with the task's current title, description, status, and assignee. The dialog SHALL use React Hook Form with Zod validation.

#### Scenario: Open edit dialog
- **WHEN** a user clicks the edit icon on a task card
- **THEN** a dialog opens with inputs for title, description, status, and assignee, pre-filled with the task's current values

#### Scenario: Edit task fields
- **WHEN** a user modifies the title, description, status, or assignee in the edit dialog and submits
- **THEN** the system calls `PUT /api/tasks/:id` with the updated fields and the dialog closes

#### Scenario: Cancel editing
- **WHEN** a user clicks cancel or closes the edit dialog
- **THEN** no changes are sent and the dialog closes

### Requirement: Inline status change
The system SHALL allow users to change a task's status directly from a dropdown on the task card, without opening the edit dialog.

#### Scenario: Change status inline
- **WHEN** a user selects a new status from the dropdown on a task card
- **THEN** the system calls `PUT /api/tasks/:id` with the new status and the card immediately reflects the change after the mutation completes

### Requirement: Assignee dropdown in create task form
The system SHALL show an assignee dropdown in the create task form, populated with the project's members.

#### Scenario: Select assignee on create
- **WHEN** a user opens the create task form for a project
- **THEN** the assignee dropdown lists all members of that project
- **WHEN** the user selects a member and submits
- **THEN** the task is created with the selected assignee

### Requirement: Task board uses React Query
The task board SHALL use `@tanstack/react-query` (`useQuery` for fetching tasks, `useMutation` for create/update/delete) instead of manual `useState`/`useEffect`/`fetch()`.

#### Scenario: Initial load shows loading state
- **WHEN** the task board loads
- **THEN** a loading indicator is shown while `useQuery` fetches tasks

#### Scenario: Empty project shows empty message
- **WHEN** the project has no tasks
- **THEN** a "No tasks yet" message is shown

#### Scenario: Fetch error shows error state
- **WHEN** the task fetch fails
- **THEN** an error message is shown with a retry button that calls `refetch`

#### Scenario: Mutation refetches tasks
- **WHEN** a task is created, updated, or deleted
- **THEN** `queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })` is called and the board re-renders with fresh data
