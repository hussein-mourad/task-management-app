## Why

Frontend forms and API data fetching are implemented with raw `fetch()` calls, manual `useState`/`useEffect` patterns, and ad-hoc validation. This leads to inconsistent form handling, no standardized loading/error states, and duplicated boilerplate. Adding React Hook Form + Zod for forms and React Query for server state will enforce consistent patterns, reduce boilerplate, and improve UX with proper loading/error/empty state management.

## What Changes

- Install `react-hook-form`, `@hookform/resolvers`, and `@tanstack/react-query` in the frontend.
- Create a centralized `QueryClient` provider wrapping the app.
- Refactor all forms (login, register, project create/edit, task create/edit, add member) to use React Hook Form with Zod schema validation.
- Refactor all data fetching (project list, task board, auth) to use React Query hooks (`useQuery`, `useMutation`) instead of `useState`/`useEffect` with raw `fetch`.
- Remove the old `useApi` pattern and direct `fetch` calls.
- Create reusable form field components for consistent UI.

## Capabilities

### New Capabilities
- `react-hook-form-integration`: Consistent form handling across all features with Zod schema validation, loading states, and error display.
- `react-query-data-layer`: Server state management using React Query queries and mutations with automatic cache invalidation.

### Modified Capabilities
- *(none — first capability specs in this project)*

## Impact

- **Dependencies**: Adds `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query` to frontend `package.json`.
- **Architecture**: Components shift from imperative `fetch` + `useState` to declarative `useQuery`/`useMutation`. Forms shift from manual `useState` to `useForm` with Zod resolvers.
- **Deleted code**: Old `lib/api.ts` axios instance replaced by React Query hooks; form state management removed from individual components.
