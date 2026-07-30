## 1. Install Dependencies

- [x] 1.1 Install `react-hook-form`, `@hookform/resolvers`, `zod` in frontend
- [x] 1.2 Install `@tanstack/react-query` in frontend

## 2. Set Up React Query Provider

- [x] 2.1 Create `QueryClientProvider` wrapper in a shared component or root layout
- [x] 2.2 Add `queryClient` with sensible defaults (staleTime: 30s, retry: 1, refetchOnWindowFocus: true)

## 3. Create Reusable Form Components

- [x] 3.1 Create `FormField` wrapper component that integrates RHF `useFormContext` with shadcn Label + error display
- [x] 3.2 Create `FormInput` component wrapping shadcn Input with RHF `register`
- [x] 3.3 Create `FormSelect` component wrapping shadcn Select with RHF controlled value
- [x] 3.4 Create `FormTextarea` component wrapping textarea with RHF `register`

## 4. Create React Query API Hooks for Auth

- [x] 4.1 Create `useLogin` mutation hook wrapping `api.post("/api/auth/login")`
- [x] 4.2 Create `useRegister` mutation hook wrapping `api.post("/api/auth/register")`
- [x] 4.3 Ensure mutations update auth context on success

## 5. Migrate Login Form to RHF + React Query

- [x] 5.1 Replace `useState` form fields with `useForm` + Zod schema
- [x] 5.2 Replace manual fetch + loading state with `useLogin` mutation
- [x] 5.3 Wire `handleSubmit` to mutation and navigate on success

## 6. Migrate Register Form to RHF + React Query

- [x] 6.1 Replace `useState` form fields with `useForm` + Zod schema
- [x] 6.2 Replace manual fetch + loading state with `useRegister` mutation
- [x] 6.3 Wire `handleSubmit` to mutation and navigate on success

## 7. Clean Up

- [x] 7.1 Remove old unused form state management from auth forms
- [x] 7.2 Verify Biome check passes (`bun run --filter frontend check`)
- [x] 7.3 Verify app compiles (`bun run --filter frontend build` or tsc check)
