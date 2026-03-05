---
description: React and frontend patterns specific to Grafana. Apply when working on files in public/app/.
globs: public/app/**/*.{tsx,ts}
alwaysApply: false
---

# React & Frontend Patterns

## Component Structure

Follow this order within every React component file:

1. Imports
2. Type/interface definitions
3. Component function
4. Styles function (`getStyles`)

```tsx
import React from 'react';
import { useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

interface Props {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: Props) {
  const styles = useStyles2(getStyles);
  return <div className={styles.wrapper}>{title}</div>;
}

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({
    padding: theme.spacing(2),
    background: theme.colors.background.primary,
  }),
});
```

## Styling

- Always use `useStyles2` with a `getStyles` function that receives the theme.
- Reference `theme.spacing()`, `theme.colors`, and `theme.typography` — never hardcode pixel values or color hex codes.
- Use the object syntax for `css()` rather than template literals for better type safety.

## Data Fetching

- Use **RTK Query** for new data fetching. Define endpoints in a dedicated `api.ts` file co-located with the feature.
- For existing code that uses `getBackendSrv().fetch()`, follow the same pattern within that feature rather than mixing approaches.
- Always handle loading and error states in the UI.

## Hooks

- Extract reusable logic into custom hooks prefixed with `use` (e.g., `usePermissions`, `useDashboardData`).
- Keep hooks focused — a hook should manage one concern.
- Avoid deeply nested hook dependencies; if a hook needs more than 3 other hooks, consider restructuring.

## Testing

- Use **React Testing Library** — query by role, label, or text, not by CSS class or test ID.
- Test user-visible behavior, not implementation details.
- Use `render()` from `@testing-library/react` with any required providers wrapped via a test utility.

## Accessibility

- All interactive elements must be keyboard-accessible.
- Use semantic HTML elements (`button`, `nav`, `main`) over generic `div` with click handlers.
- Provide `aria-label` for icon-only buttons and non-text interactive elements.
