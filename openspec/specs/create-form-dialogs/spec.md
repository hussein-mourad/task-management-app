# create-form-dialogs Specification

## Purpose
TBD - created by syncing change pagination-and-dialogs. Update Purpose after archive.
## Requirements
### Requirement: Create task dialog
The system SHALL present the new task creation form in a dialog instead of an inline card.

#### Scenario: Open create task dialog
- **WHEN** a member clicks the "New Task" button on the task board
- **THEN** a dialog SHALL open containing the task creation form

#### Scenario: Create task from dialog
- **WHEN** a member fills in the required title and submits the create task dialog
- **THEN** the task SHALL be created
- **THEN** the dialog SHALL close
- **THEN** the task SHALL appear on the task board

#### Scenario: Cancel create task dialog
- **WHEN** a member clicks Cancel in the create task dialog
- **THEN** the dialog SHALL close
- **THEN** no task SHALL be created

### Requirement: Create project dialog
The system SHALL present the new project creation form in a dialog instead of an inline card.

#### Scenario: Open create project dialog
- **WHEN** a user clicks the "New Project" button on the project list page
- **THEN** a dialog SHALL open containing the project creation form

#### Scenario: Create project from dialog
- **WHEN** a user fills in the required name and submits the create project dialog
- **THEN** the project SHALL be created
- **THEN** the dialog SHALL close
- **THEN** the project SHALL appear in the project list

#### Scenario: Cancel create project dialog
- **WHEN** a user clicks Cancel in the create project dialog
- **THEN** the dialog SHALL close
- **THEN** no project SHALL be created
