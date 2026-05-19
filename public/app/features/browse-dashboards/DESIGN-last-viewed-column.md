# Design: “Last viewed” column (Dashboard Browser)

## Established patterns reused

| Concern | Existing pattern | Use here |
|--------|-------------------|----------|
| Table columns | `react-table` + `useCustomFlexLayout` flex `width` ratios (`DashboardsTree.tsx`) | New column `id: 'lastViewed'`, `width: 2` between Name (`3`) and Tags (`2`). |
| Row cells | Dedicated cell components (`NameCell`, `TagsCell`, `CheckboxCell`) | New `LastViewedCell.tsx` — same `DashboardsTreeCellProps`, same `row.original.item` branching. |
| Typography | `@grafana/ui` `Text` with `color="secondary"`, `truncate` (`NameCell`) | Secondary / muted copy for “Never”; `bodySmall` for compact tabular density. |
| Loading / skeleton | `react-loading-skeleton` (`NameCell`, `TagsCell`) | Narrow `<Skeleton width={72} />` for `pagination-placeholder`. |
| Dates | `@grafana/data` `dateTime`, `dateTimeFormat`, `dateTimeFormatTimeAgo` (`VersionHistoryComparison`, `LibraryVizPanelInfo`) | Relative label in cell; absolute string in `Tooltip` (hover for precise time). |
| Interaction | `@grafana/ui` `Tooltip` (`CheckboxCell`) | Tooltip on the relative-time label for full timestamp. |
| Theme tokens | `useStyles2` + `css` (`@emotion/css`) | `theme.colors.border.medium` for optional underline affordance on hover target. |
| i18n | `t('browse-dashboards.*', 'Fallback')` | Keys: `dashboards-tree.last-viewed-column`, `last-viewed-cell.never`, `last-viewed-cell.invalid-date`. |

## Data model (frontend)

- `DashboardViewItem.lastViewed?: string | number` — ISO or epoch from search/API (`public/app/features/search/types.ts`).
- `DashboardQueryResult.lastViewed` — same, for dataframe rows (`service/types.ts`).
- `queryResultToViewItem` copies `lastViewed` when present (`service/utils.ts`).

## Component structure

```
DashboardsTree
├── columns: [ checkbox? | name | lastViewed | tags ]
└── cells
    └── LastViewedCell  (dashboards: date or “Never”; folders: empty; ui rows: skeleton / null)
```

## Open items (implementation phase)

- Backend field name and format must match what we map in `queryResultToViewItem`.
- Confirm accessibility: screen readers get full time from `Tooltip` content when hovering focusable trigger (verify Radix/tooltip behavior).
- Optional: add e2e `data-testid` for the column if Playwright needs to assert values.
