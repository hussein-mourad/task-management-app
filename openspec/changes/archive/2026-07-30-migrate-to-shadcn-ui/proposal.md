## Why

The frontend currently uses raw HTML elements (`<button>`, `<input>`, `<select>`, `<textarea>`) with ad-hoc Tailwind classes for styling. shadcn is already initialized but only the `button` component exists. Migrating to shadcn components provides a consistent, accessible, themeable design system with dark mode support, improving UX and maintainability.

## What Changes

- Add missing shadcn UI components: `card`, `input`, `label`, `select`, `badge`, `dialog`, `textarea`
- Replace raw `<button>` elements with shadcn `Button` component
- Replace raw `<input>` elements with shadcn `Input` component
- Replace raw `<select>` elements with shadcn `Select` component
- Replace raw `<textarea>` elements with shadcn `Textarea` component
- Add dark mode toggle to the navigation header
- Apply shadcn Card wrapper to auth forms, project cards, task cards, and form containers
- Add priority Badge component to task cards

## Capabilities

### New Capabilities
- `dark-mode`: Dark mode toggle and system preference detection
- `shadcn-component-library`: The shadcn UI component set available to all features

### Modified Capabilities
- *(none — this is purely a UI implementation change, no behavior changes)*

## Impact

- **Dependencies**: None — shadcn components are self-contained (already installed)
- **Files changed**: All 4 feature components (login-form, register-form, project-list, task-board) + root layout + new shadcn component files under `src/components/ui/`
- **No impact**: Backend, API, auth logic, routing remain untouched
