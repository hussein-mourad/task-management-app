## ADDED Requirements

### Requirement: Dark mode toggle
The system SHALL provide a dark mode toggle in the navigation header that switches between light and dark themes.

#### Scenario: Toggle dark mode on
- **WHEN** user clicks the dark mode toggle button
- **THEN** the page theme SHALL switch to dark mode
- **AND** the preference SHALL be persisted in localStorage

#### Scenario: Toggle dark mode off
- **WHEN** user clicks the dark mode toggle button while in dark mode
- **THEN** the page theme SHALL switch to light mode
- **AND** the preference SHALL be persisted in localStorage

#### Scenario: Respect system preference on first visit
- **WHEN** a user visits for the first time with no saved preference
- **THEN** the theme SHALL follow the OS `prefers-color-scheme` setting

#### Scenario: Persist preference across sessions
- **WHEN** a user sets a dark mode preference and reloads the page
- **THEN** the saved preference SHALL be applied on load
