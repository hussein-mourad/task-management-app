## Context

The frontend uses shadcn (initialized with the "base-vega" style wrapping Base UI primitives) but only the `button` component exists. All other UI elements are raw HTML with ad-hoc Tailwind classes. Styles.css already has dark mode CSS variables configured.

## Goals / Non-Goals

**Goals:**
- Add missing shadcn UI components (card, input, select, badge, dialog, label, textarea)
- Migrate all feature components to use shadcn components
- Add dark mode toggle in the navigation header
- Maintain clean, accessible, responsive UI

**Non-Goals:**
- No behavioral or functional changes
- No backend changes
- No layout restructuring beyond component swaps

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Component source | Official `shadcn` registry | Already initialized; components are local copies we can customize |
| Dark mode strategy | CSS class-based toggle (`class` strategy) with `localStorage` persistence | Matches existing `.dark` variables in `styles.css` |
| Form layout | Inline forms (no dialog/modal) | Keeps existing UX pattern; simpler and more accessible |
| Select component | shadcn Select (Base UI based) | Consistent with design system vs raw `<select>` |

## Risks / Trade-offs

- **Button component change**: Existing button has `bg-blue-600` hardcoded; shadcn Button uses theme vars (`bg-primary`). Colors may shift slightly — verify after migration.
- **Select accessibility**: shadcn Select is more complex than native `<select>`. Ensure keyboard navigation works.
- **Dark mode**: Toggle must persist preference and respect `prefers-color-scheme`.
