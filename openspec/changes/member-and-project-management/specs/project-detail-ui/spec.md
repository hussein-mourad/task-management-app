## ADDED Requirements

### Requirement: View project details
The project detail page SHALL display the project name, description, and the current user's role (admin/member) at the top of the page.

#### Scenario: Admin views project
- **WHEN** an admin user navigates to `/projects/$projectId`
- **THEN** they see the project name, description (if any), and a badge showing their "admin" role

#### Scenario: Member views project
- **WHEN** a member user navigates to `/projects/$projectId`
- **THEN** they see the project name, description (if any), and a badge showing their "member" role

### Requirement: Edit project
Admin users SHALL be able to edit the project name and description via a dialog.

#### Scenario: Admin opens edit dialog
- **WHEN** an admin user clicks the "Edit" button
- **THEN** a dialog opens with pre-populated name and description fields

#### Scenario: Admin saves edit
- **WHEN** an admin user submits the edit form with valid data
- **THEN** the project is updated via `PUT /api/projects/:id` and the display refreshes

#### Scenario: Non-admin cannot edit
- **WHEN** a non-admin user views the project
- **THEN** the "Edit" button is not shown

### Requirement: Delete project
Admin users SHALL be able to delete a project with confirmation.

#### Scenario: Admin deletes project
- **WHEN** an admin user clicks "Delete" and confirms in the confirmation dialog
- **THEN** the project and all its members and tasks are deleted, and the user is redirected to the projects list

#### Scenario: Admin cancels delete
- **WHEN** an admin user clicks "Delete" and then cancels the confirmation dialog
- **THEN** the project is not deleted and the user stays on the project page

#### Scenario: Non-admin cannot delete
- **WHEN** a non-admin user views the project
- **THEN** the "Delete" button is not shown
