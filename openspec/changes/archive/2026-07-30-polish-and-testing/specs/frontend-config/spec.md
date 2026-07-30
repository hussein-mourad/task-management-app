## ADDED Requirements

### Requirement: Configurable API URL
The frontend SHALL read the backend API URL from the `VITE_BACKEND_URL` environment variable.

#### Scenario: Env var set
- **WHEN** `VITE_BACKEND_URL` is set in the environment
- **THEN** the axios client uses that value as its base URL

#### Scenario: Env var not set
- **WHEN** `VITE_BACKEND_URL` is not set
- **THEN** the axios client defaults to `http://localhost:8000`
