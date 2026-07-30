## ADDED Requirements

### Requirement: React Query manages all server state

All API data fetching and mutations SHALL use `@tanstack/react-query` instead of raw `useState`/`useEffect` patterns.

#### Scenario: QueryClientProvider wraps the app
- **WHEN** the application renders
- **THEN** a `QueryClientProvider` SHALL wrap the entire component tree
- **THEN** the `QueryClient` SHALL have sensible defaults (staleTime: 30s, retry: 1, refetchOnWindowFocus: true)

#### Scenario: Auth API calls use React Query mutations
- **WHEN** a user logs in or registers
- **THEN** the login/register functions SHALL be wrapped in `useMutation` hooks
- **THEN** on success, the mutation SHALL update the auth context with user + token
- **THEN** on error, the mutation SHALL surface the error message for display
- **THEN** `isPending` SHALL control the submit button disabled and text state

#### Scenario: Axios client handles HTTP layer
- **WHEN** React Query makes an API call
- **THEN** it SHALL use a custom `apiClient` function that delegates to the existing axios instance in `lib/api.ts`
- **THEN** the axios interceptor SHALL continue to inject auth tokens and handle 401 responses

#### Scenario: Custom hooks encapsulate queries and mutations
- **WHEN** a feature needs API access
- **THEN** it SHALL import custom hooks from the feature's API module (e.g., `useLogin`, `useRegister`)
- **THEN** these hooks SHALL wrap `useMutation` or `useQuery` internally
- **THEN** components SHALL NOT import or call `apiClient` directly
