## ADDED Requirements

### Requirement: Forms use React Hook Form with Zod validation

All forms in the application SHALL use `react-hook-form` with `@hookform/resolvers/zod` for state management and validation.

#### Scenario: Form renders with RHF register and errors
- **WHEN** a form component renders
- **THEN** it SHALL use `useForm` from `react-hook-form` with a Zod schema via `zodResolver`
- **THEN** field values SHALL be bound via `register()` or controlled components
- **THEN** validation errors SHALL display inline below each field

#### Scenario: Form submission validates via Zod schema
- **WHEN** the user submits the form
- **THEN** `handleSubmit` SHALL run the Zod schema validation before calling the handler
- **THEN** invalid fields SHALL show error messages without making an API call

#### Scenario: Reusable form field components exist
- **WHEN** a form needs an input, select, or textarea field
- **THEN** it SHALL use shared `FormField`, `FormInput`, `FormSelect`, `FormTextarea` components that wrap shadcn UI primitives with RHF integration

### Requirement: Auth forms migrated first

The login and register forms SHALL be the first components migrated to React Hook Form + Zod, serving as the pattern for all subsequent forms.

#### Scenario: Login form uses RHF with schema
- **WHEN** login form renders
- **THEN** email field SHALL use `register("email")` with Zod validation (valid email, required)
- **THEN** password field SHALL use `register("password")` with Zod validation (min 1 char, required)
- **THEN** submit button SHALL be disabled while mutation is pending

#### Scenario: Register form uses RHF with schema
- **WHEN** register form renders
- **THEN** name field SHALL use `register("name")` with Zod validation (min 2 chars, required)
- **THEN** email field SHALL use `register("email")` with Zod validation (valid email, required)
- **THEN** password field SHALL use `register("password")` with Zod validation (min 8 chars, required)
