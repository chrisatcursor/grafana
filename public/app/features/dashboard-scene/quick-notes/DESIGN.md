# Quick Notes — Design Specification

## Overview

Quick Notes is a dashboard-scoped sticky-note drawer accessible from the dashboard toolbar. It follows established Grafana dashboard-scene overlay and drawer patterns.

## Reference patterns

| Concern | Reference | Notes |
|---------|-----------|-------|
| Scene overlay drawer | `saving/SaveDashboardDrawer.tsx` | `SceneObjectBase` + `DashboardScene.state.overlay` |
| Drawer shell | `@grafana/ui` `Drawer` | `size="sm"`, `subtitle`, `onClose`, `scrollableContent` |
| Toolbar icon button | `new-toolbar/actions/EditDashboardSwitch.tsx` | `ToolbarButton` with `variant="canvas"`, `icon` |
| Toolbar registration | `new-toolbar/LeftActions.tsx` | `renderActionElements` + `ToolbarAction` |
| Form layout | `saving/SaveDashboardForm.tsx` | `Stack`, `Field`, `TextArea`, `Button` |
| API client | `core/history/RichHistoryRemoteStorage.ts` | `getBackendSrv()` typed fetch/post/patch/delete |
| Scene open API | `DashboardScene.openSaveDrawer()` | `setState({ overlay: new QuickNotesDrawer(...) })` |

## Placement

- **Toolbar**: `LeftActions` group `actions`, after star/public badge
- **Visibility**: `hasUid && isShowingDashboard && !isEditingDashboard && !isSnapshot && !isEmbedded`
- **Rationale**: Notes are contextual dashboard metadata (like star), not a save/share action

## Component tree

```
LeftActions
└── QuickNotesButton
    └── onClick → dashboard.openQuickNotesDrawer()

DashboardSceneRenderer
└── overlay (QuickNotesDrawer SceneObject)
    └── QuickNotesDrawer.Component
        └── @grafana/ui Drawer (size="sm")
            └── QuickNotesContent
                ├── Alert (read-only / error)
                ├── QuickNotesEmptyState (when no note)
                ├── QuickNotesEditor (TextArea + Save/Delete + ConfirmModal)
                └── QuickNotesMeta (last updated timestamp)
```

## Design tokens & UI primitives

| Token / primitive | Usage |
|-------------------|-------|
| `theme.spacing(n)` | Vertical rhythm in drawer body (`Stack gap`) |
| `theme.colors.text.secondary` | Meta text (last updated) |
| `theme.colors.border.weak` | Optional divider above footer actions |
| `Drawer size="sm"` | 25vw / min 384px — appropriate for text notes |
| `ToolbarButton variant="canvas"` | Matches edit/share adjacent controls |
| `TextArea` | Multiline note body (auto-resize via `rows` prop) |
| `Button variant="primary"` | Save |
| `Button variant="destructive"` | Delete (with confirm) |
| `Spinner` | Loading state |
| `Alert severity="error"` | API errors |

## Interaction model

1. User clicks **Notes** toolbar button → `openQuickNotesDrawer()`
2. Drawer opens; `useQuickNotes` fetches note for `dashboard.uid`
3. **Read-only** when `!meta.canEdit`; **editable** when `meta.canEdit`
4. **Save** persists via POST (create) or PATCH (update)
5. **Delete** clears note with confirm modal
6. **Close** dismisses overlay (`overlay: undefined`)

## API contract (frontend expectation)

```
GET    /api/dashboards/uid/:uid/quick-notes
POST   /api/dashboards/uid/:uid/quick-notes
PATCH  /api/dashboards/uid/:uid/quick-notes/:noteUid
DELETE /api/dashboards/uid/:uid/quick-notes/:noteUid
```

## Accessibility

- Toolbar button: `aria-label` + visible tooltip
- Drawer: uses built-in `Drawer` focus trap and title `id`
- TextArea: associated `Field` label
- Delete: confirm via `ConfirmModal` pattern

## Test IDs

| Element | `data-testid` |
|---------|---------------|
| Toolbar button | `quick-notes-button` |
| Drawer root | `quick-notes-drawer` |
| TextArea | `quick-notes-textarea` |
| Save button | `quick-notes-save` |
| Delete button | `quick-notes-delete` |

## Scaffold status (design phase)

| Artifact | Status |
|----------|--------|
| `DESIGN.md` | Done |
| `QuickNotesButton` → `LeftActions` | Done |
| `QuickNotesDrawer` SceneObject + `openQuickNotesDrawer()` | Done |
| `QuickNotesContent` / `Editor` / `EmptyState` / `Meta` | Done |
| Delete `ConfirmModal` | Done |
| `api.ts` / `types.ts` / `useQuickNotes` stubs | Done |
| Component unit tests | Done |

## Out of scope (implementation phase)

- Backend CRUD API + migration
- Markdown rendering
- Multiple notes / threaded comments
- Legacy `DashNav` integration
- Feature toggle generation (`QUICK_NOTES_ENABLED` is a local constant)
- E2E selectors in `@grafana/e2e-selectors`
