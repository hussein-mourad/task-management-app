## ADDED Requirements

### Requirement: User can list all users
The system SHALL provide a `GET /api/users` endpoint returning all registered users.

#### Scenario: Successful listing
- **WHEN** an authenticated user requests `GET /api/users`
- **THEN** the server responds with a 200 status and a JSON array of `{ id, name, email }` objects

### Requirement: User can list project members
The system SHALL provide a `GET /api/projects/:id/members` endpoint returning all members of a project.

#### Scenario: Successful member listing
- **WHEN** an authenticated user who is a member of the project requests `GET /api/projects/:id/members`
- **THEN** the server responds with a 200 status and a JSON array of `{ id, name, email }` objects

#### Scenario: Non-member access
- **WHEN** an authenticated user who is NOT a member of the project requests `GET /api/projects/:id/members`
- **THEN** the server responds with a 403 status

### Requirement: assignedTo must be a project member
When creating or updating a task, the system SHALL validate that the `assignedTo` user, if provided, is a member of the task's project.

#### Scenario: Valid assignee on task creation
- **WHEN** an authenticated user creates a task with `assignedTo` set to a user who is a member of the project
- **THEN** the server accepts the task with a 201 status

#### Scenario: Invalid assignee on task creation
- **WHEN** an authenticated user creates a task with `assignedTo` set to a user who is NOT a member of the project
- **THEN** the server responds with a 400 status and an error message

#### Scenario: Valid assignee on task update
- **WHEN** an authenticated user updates a task with `assignedTo` set to a user who is a member of the project
- **THEN** the server accepts the update with a 200 status

#### Scenario: Invalid assignee on task update
- **WHEN** an authenticated user updates a task with `assignedTo` set to a user who is NOT a member of the project
- **THEN** the server responds with a 400 status and an error message
