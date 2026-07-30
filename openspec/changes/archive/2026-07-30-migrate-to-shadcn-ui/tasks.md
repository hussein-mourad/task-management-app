## 1. Add shadcn Components

- [x] 1.1 Install shadcn components: card, input, select, badge, dialog, label

## 2. Dark Mode

- [x] 2.1 Create `use-dark-mode` hook with localStorage persistence and system preference fallback
- [x] 2.2 Create `ThemeToggle` component with sun/moon icons
- [x] 2.3 Update root layout to apply `.dark` class and include ThemeToggle

## 3. Migrate Auth Components

- [x] 3.1 Migrate `login-form.tsx` to use shadcn Card, Input, Label, Button components
- [x] 3.2 Migrate `register-form.tsx` to use shadcn Card, Input, Label, Button components

## 4. Migrate Project Components

- [x] 4.1 Migrate `project-list.tsx` to use shadcn Card, Input, Button, Badge components

## 5. Migrate Task Components

- [x] 5.1 Migrate `task-board.tsx` to use shadcn Card, Select, Input, Badge, Button components

## 6. Verification

- [x] 6.1 Run `bun run --filter frontend check` to confirm no lint regressions
