## ADDED Requirements

### Requirement: Security headers
The backend SHALL apply security-related HTTP headers via helmet.

#### Scenario: Security headers present
- **WHEN** a client makes any request to the API
- **THEN** the response includes security headers (X-Content-Type-Options, X-Frame-Options, etc.)

### Requirement: CORS
The backend SHALL allow cross-origin requests from configured origins.

#### Scenario: Allowed origin
- **WHEN** a request comes from FRONTEND_URL origin
- **THEN** the response includes CORS headers allowing the request

### Requirement: Rate limiting
The backend SHALL rate-limit requests to prevent abuse.

#### Scenario: Under limit
- **WHEN** a client makes fewer than 100 requests per 15 minutes
- **THEN** all requests are processed normally

#### Scenario: Over limit
- **WHEN** a client exceeds 100 requests per 15 minutes
- **THEN** subsequent requests receive a 429 Too Many Requests response

### Requirement: Request logging
The backend SHALL log incoming HTTP requests via morgan.

#### Scenario: Request logged
- **WHEN** a request is made to any API route
- **THEN** the request method, URL, status code, and duration are logged to stdout
