## Context

The frontend currently uses raw `fetch()` calls, manual `useState`/`useEffect` patterns for data fetching, and ad-hoc form state management via `useState`. Forms have no centralized validation library — Zod schemas exist on the backend but aren't reused on the frontend. The axios client in `lib/api.ts` handles auth token injection and 401 redirects but is used directly only in the feature `api.ts` modules. Components like `login-form.tsx`, `register-form.tsx`, `project-list.tsx`, and `task-board.tsx` each manage their own loading/error state manually.

## Goals / Non-Goals

**Goals:**
- Install and configure `react-hook-form` with `@hookform/resolvers/zod` for all forms.
- Install and configure `@tanstack/react-query` for all server-state management.
- Create a reusable `QueryClient` provider at the app root.
- Refactor auth forms (login + register) to use React Hook Form + Zod as a proof of pattern.
- Refactor auth data fetching (login, register, getMe) to use React Query mutations.
- Create reusable form UI primitives (`FormField`, `FormInput`, etc.) wrapping shadcn components.

**Non-Goals:**
- Refactoring project/task features to RHF + React Query (deferred to subsequent changes).
- Adding new backend endpoints.
- Removing the existing axios interceptor (still handles auth token injection for React Query's axios calls).

## Decisions

1. **React Query over plain `useEffect` + `fetch`**
   - React Query provides: automatic caching, deduplication, background refetch, loading/error states, cache invalidation on mutations. This eliminates ~15 lines of boilerplate per data-fetching component.
   - Alternative considered: Zustand + fetch. Rejected — Zustand is a client-state solution, React Query is purpose-built for server state.

2. **`@hookform/resolvers/zod` for form validation**
   - RHF's built-in validation requires manual rules. Zod resolvers let us define schemas once and get typed errors.
   - Alternative considered: plain HTML5 validation + manual RHF rules. Rejected — duplicates validation logic (already have Zod on backend).

3. **React Query axios integration**
   - Use the existing axios instance (`lib/api.ts`) as React Query's default `queryClient` via a custom `apiClient` that wraps axios calls. React Query handles the query lifecycle; axios handles the HTTP layer (auth headers, base URL, error parsing).
   - Alternative considered: `fetch` via React Query's native API. Rejected — loses axios interceptor auth injection.

4. **Feature-based `api.ts` files remain, but now return Zod-validated types via React Query hooks**
   - Each feature exports custom React Query hooks (`useLogin`, `useProjects`, etc.) that wrap the existing `api.ts` functions.
   - `api.ts` files stay as the thin I/O layer; hooks are the component-facing API.

## Risks / Trade-offs

- **[Risk] Bundle size increase** → `react-hook-form` + `@tanstack/react-query` add ~25KB gzipped. Acceptable for a full-stack app.
- **[Risk] Learning curve** → RHF + React Query patterns differ from imperative `useState`. Mitigated by consistent hook patterns documented in each feature's `api.ts`.
- **[Trade-off] Axios + React Query double layer** → We keep both instead of using React Query's built-in fetch. The axios interceptor for auth is too valuable to replace.
