## ADDED Requirements

### Requirement: UI components use shadcn design system
The system SHALL use shadcn components (card, input, select, badge, label, button) for all UI elements instead of raw HTML elements.

#### Scenario: All buttons use shadcn Button component
- **WHEN** rendering any button in the application
- **THEN** it SHALL use the `Button` component from `@/components/ui/button`

#### Scenario: Form inputs use shadcn Input component
- **WHEN** rendering a text/email/password input field
- **THEN** it SHALL use the `Input` component from `@/components/ui/input`

#### Scenario: Select dropdowns use shadcn Select component
- **WHEN** rendering a dropdown selection
- **THEN** it SHALL use the `Select` component from `@/components/ui/select`

#### Scenario: Priority badges use shadcn Badge component
- **WHEN** displaying a task priority indicator
- **THEN** it SHALL use the `Badge` component from `@/components/ui/badge`

#### Scenario: Form sections use shadcn Card component
- **WHEN** rendering a form or grouped content section
- **THEN** it SHALL use the `Card` component from `@/components/ui/card`
