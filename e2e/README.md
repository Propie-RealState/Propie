# Propie E2E Smoke Tests

Minimal Playwright suite covering MVP business flows.

## Prerequisites

- Node.js 20+
- pnpm
- Docker (Postgres via `pnpm db:up`)
- `.env` at repo root (copy from `.env.example`)

### Required environment variables

| Variable | Purpose |
| --- | --- |
| `LOCAL_DB_*` or `DATABASE_URL` | Seed data + backend |
| `LOCAL_JWT_SECRET` / `LOCAL_JWT_REFRESH_SECRET` | Auth |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Publish flow image upload |

Optional:

| Variable | Default |
| --- | --- |
| `E2E_PASSWORD` | `E2eTestPass1!` |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` |

## Seed data

`global-setup` creates stable users and fixtures:

- `e2e-owner@propie.test` (OWNER) — publish + visit scheduling
- `e2e-client@propie.test` (CLIENT) — contact + logout
- Published property **E2E Smoke Contact Property**
- Open conversation for visit scheduling

Output: `e2e/.seed-output.json` (gitignored).

## Run locally

```bash
pnpm install
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright starts backend (`:3000`) and frontend (`:5173`) when they are not already running.

On Windows, run `pnpm db:up` and `pnpm run db:setup` once before the first E2E run (the Playwright web server skips `db:setup` on win32 because bash scripts use CRLF).

### Run against existing dev servers

```bash
pnpm db:up && pnpm run db:setup
pnpm run dev          # terminal 1
pnpm --dir web dev    # terminal 2
pnpm test:e2e
```

## CI

```bash
pnpm db:up
pnpm run db:setup
pnpm test:e2e
```

Set `CI=true`, database credentials, JWT secrets, and Supabase keys in the pipeline environment.

## Scenarios

| Spec | Flow |
| --- | --- |
| `auth-explore.spec.ts` | Login → Explore nav → Logout |
| `publish-property.spec.ts` | Owner publish happy path → My Properties |
| `contact-property.spec.ts` | Client contact → conversation thread |
| `schedule-visit.spec.ts` | Owner schedules visit → visits list |
