---
description: Core coding guidelines for the Grafana codebase. Apply when writing or reviewing any Go or TypeScript code.
globs:
alwaysApply: true
---

# Grafana Coding Guidelines

## General Principles

- **Follow existing patterns.** Before writing new code, read the surrounding files. Match the style, naming conventions, and abstractions already in use.
- **Keep changes minimal and focused.** A PR should do one thing well. Avoid mixing refactors with feature work or bug fixes.
- **Prefer composition over inheritance.** Both on the backend (Go interfaces, embedding) and frontend (React hooks, higher-order components).

## Backend (Go)

- All new services must use **Wire dependency injection**. Define a `ProvideService` function and register it in the appropriate `wire.go`. Run `make gen-go` after changes.
- Business logic belongs in `pkg/services/<domain>/`, never in API handlers. Handlers should validate input, call a service method, and format the response.
- Use the `log.Logger` from `pkg/infra/log` — do not use `fmt.Println` or the standard library logger.
- Errors must be wrapped with context using `fmt.Errorf("descriptive message: %w", err)`. Never swallow errors silently.
- Database access goes through `sqlstore` or the `db.DB` interface. Never import database drivers directly in service code.

## Frontend (TypeScript / React)

- Use **function components** with hooks. Class components are legacy and should not be introduced.
- Style with **Emotion CSS-in-JS** via `useStyles2(getStyles)`. Do not use inline styles or CSS modules.
- State management: use **Redux Toolkit** slices for global state, React state/context for local state. Use **RTK Query** for server data fetching.
- All user-facing strings must be wrapped with `t()` or `<Trans>` for internationalization. Run `make i18n-extract` after adding new strings.

## Security

- Sanitize all user input rendered in the UI to prevent XSS.
- Use parameterized queries for all database operations — never concatenate user input into SQL strings.
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary, and always sanitize the content first.

## Code Organization

- **One concern per file.** A file should contain a single component, service, or utility — not a grab-bag of related functions.
- **Name files after what they export.** `UserService.ts` exports `UserService`, `usePermissions.ts` exports the `usePermissions` hook.
- **Co-locate tests** next to the code they test: `MyComponent.tsx` → `MyComponent.test.tsx`.
