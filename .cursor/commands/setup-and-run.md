---
description: Set up and run the Grafana development environment from scratch. Installs dependencies, starts backing services, and launches both backend and frontend dev servers.
---

# Setup & Run Grafana

Walk me through setting up and running Grafana locally for development. Follow these steps in order, checking for issues at each stage.

## Step 1: Prerequisites Check

Verify the required tools are installed:

- **Go** (check with `go version`) — needs to match the version in `go.mod`
- **Node.js** (check with `node --version`) — needs to match the version in `.nvmrc`
- **Yarn** (check with `yarn --version`)
- **Make** (check with `make --version`)
- **Docker** (check with `docker --version`) — needed for backing services

If any are missing, let me know and suggest how to install them.

## Step 2: Install Dependencies

```bash
yarn install --immutable
```

If this fails, check for Node.js version mismatches or stale lockfile issues.

## Step 3: Start Backing Services (Optional)

If I need databases or other services for my work, start them with:

```bash
make devenv sources=postgres,influxdb,loki
```

Ask me what I'm working on to determine which services are needed. If I'm just doing frontend work, this can be skipped.

## Step 4: Build and Start Backend

```bash
make run
```

This builds the Go backend with hot reload. Wait for the "HTTP Server Listen" log line before proceeding. The server runs on `localhost:3000`.

## Step 5: Start Frontend Dev Server

In a separate terminal:

```bash
yarn start
```

This starts the webpack dev server with hot module replacement. Frontend changes will auto-reload in the browser.

## Step 6: Verify

Open `http://localhost:3000` in the browser. Default credentials are `admin` / `admin`.

Confirm both servers are running and the UI loads correctly. If there are issues, check the terminal output for errors and help me debug.
