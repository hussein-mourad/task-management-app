## ADDED Requirements

### Requirement: View project members
The project detail page SHALL display a list of all project members showing their name, email, and role.

#### Scenario: View members
- **WHEN** a user navigates to `/projects/$projectId`
- **THEN** they see a section listing all members with their name, email, and role badge (admin/member)

### Requirement: Add member
Admin users SHALL be able to add a new member to the project by selecting a user from a dropdown of all registered users.

#### Scenario: Admin opens add member dialog
- **WHEN** an admin user clicks "Add Member"
- **THEN** a dialog opens with a user select dropdown (name + email) and a role selector

#### Scenario: Admin adds a new member
- **WHEN** an admin user selects a user and submits
- **THEN** the member is added via `POST /api/projects/:id/members` and the member list refreshes

#### Scenario: Adding duplicate member fails
- **WHEN** an admin user tries to add a user who is already a member
- **THEN** the backend returns a 409 conflict error and the UI shows an appropriate error message

#### Scenario: Non-admin cannot add members
- **WHEN** a non-admin user views the project
- **THEN** the "Add Member" button is not shown

### Requirement: Remove member
Admin users SHALL be able to remove a member from the project with confirmation.

#### Scenario: Admin removes a member
- **WHEN** an admin user clicks "Remove" on a member and confirms
- **THEN** the member is removed via `DELETE /api/projects/:id/members/:userId` and the member list refreshes

#### Scenario: Cannot remove last admin
- **WHEN** an admin user tries to remove the last admin from the project
- **THEN** the backend returns a 400 error and the UI shows "Cannot remove the last admin"

#### Scenario: Admin cannot remove self as last admin
- **WHEN** the last admin tries to remove themselves from the project
- **THEN** the backend prevents it and the UI shows an error

#### Scenario: Remove button hidden for last admin
- **WHEN** a member is the project's only admin
- **THEN** the "Remove" button for that member is disabled or hidden with a tooltip showing "Cannot remove the last admin"
