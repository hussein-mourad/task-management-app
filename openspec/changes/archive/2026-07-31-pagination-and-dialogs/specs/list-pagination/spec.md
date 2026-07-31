## ADDED Requirements

### Requirement: Paginated project list
The system SHALL support pagination on `GET /api/projects` via `page` and `limit` query parameters.

#### Scenario: Default project page
- **WHEN** a user requests `GET /api/projects` without query params
- **THEN** the response SHALL contain a `projects` array with at most the default page size
- **THEN** the response SHALL include `page` (default `1`), `limit`, and `total` metadata

#### Scenario: Request a specific page
- **WHEN** a user requests `GET /api/projects?page=2&limit=10`
- **THEN** the response SHALL contain only the second page of up to 10 projects
- **THEN** the response SHALL report `page: 2`, `limit: 10`, and the total project count

#### Scenario: Page beyond available data
- **WHEN** a user requests a page number beyond the last page
- **THEN** the response SHALL return an empty `projects` array
- **THEN** the `total` SHALL still reflect the full count

### Requirement: Paginated task list
The system SHALL support pagination on `GET /api/projects/:id/tasks` via `page` and `limit` query parameters, while preserving existing `status`, `priority`, and `assignee` filters.

#### Scenario: Default task page
- **WHEN** a member requests `GET /api/projects/:id/tasks` without query params
- **THEN** the response SHALL contain a `tasks` array with at most the default page size
- **THEN** the response SHALL include `page` (default `1`), `limit`, and `total` metadata

#### Scenario: Pagination combined with filters
- **WHEN** a member requests `GET /api/projects/:id/tasks?status=todo&page=1&limit=5`
- **THEN** the response SHALL contain only `todo` tasks on the requested page
- **THEN** the response SHALL include `total` counting only tasks matching the filter

#### Scenario: Page beyond available data
- **WHEN** a user requests a page number beyond the last page
- **THEN** the response SHALL return an empty `tasks` array
- **THEN** the `total` SHALL still reflect the full filtered count

### Requirement: Deterministic list ordering
Paginated project and task lists SHALL use a stable ordering so items do not move between pages.

#### Scenario: Tasks ordered by creation date
- **WHEN** a user requests a page of tasks
- **THEN** tasks SHALL be ordered by `createdAt` descending
- **THEN** tasks with equal `createdAt` SHALL be ordered by `id` as a tiebreaker

#### Scenario: Projects ordered by creation date
- **WHEN** a user requests a page of projects
- **THEN** projects SHALL be ordered by `createdAt` descending
- **THEN** projects with equal `createdAt` SHALL be ordered by `id` as a tiebreaker

### Requirement: Project list pagination UI
The system SHALL provide pagination controls on the project list page to browse projects in pages.

#### Scenario: Browse project pages
- **WHEN** a user clicks the next page button on the project list
- **THEN** the list SHALL show the next page of projects
- **THEN** the current page indicator SHALL update

#### Scenario: Previous page navigation
- **WHEN** a user clicks the previous page button and is not on the first page
- **THEN** the list SHALL show the previous page of projects
- **THEN** the current page indicator SHALL update

#### Scenario: Previous disabled on first page
- **WHEN** a user is on the first page of the project list
- **THEN** the previous page button SHALL be disabled
