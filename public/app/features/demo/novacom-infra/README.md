# NovaCom Cloud Infrastructure Monitoring (DEV-29)

Demo Scenes dashboard for **NovaCom Technologies** — synthetic data via **Grafana TestData** only.

## URL

After starting Grafana (`make run` + `yarn start:liveReload`):

**`/demo/novacom-infrastructure`**

## Jira

- Task: **DEV-29** — add this URL in a comment when closing the ticket.
- PRD: Confluence — *PRD: Cloud Infrastructure Monitoring Dashboard*.

## Requirements

- A **TestData** datasource must exist (Connections → Add data source → TestData). Some installs do not ship one by default.
- **Frontend assets** must be served (`yarn start:liveReload` or `yarn build`); backend-only (`make run`) shows “failed to load application files.”

## Troubleshooting

- **Blank page or error:** This page renders the Scenes **controls + panels only** (not the full dashboard toolbar) so the demo works without registering the scene in `DashboardSrv`.
- **“TestData datasource required”:** Add the TestData datasource for your org, then reload.
