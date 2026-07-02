# Performance baseline

Canonical latency log format for all performance phases:

```
GET /properties 182 ms
POST /login 41 ms
```

Each line is `{METHOD} {PATH} {MS} ms`. Use route paths as seen in product logs (`/login`, not `/auth/login`).

## Probe rules

| Rule | Detail |
|------|--------|
| No authorization headers | Anonymous requests only |
| No tokens | Do not send cookies or JWT |
| No login payload | `POST /login` with empty body; 400 is OK — measure round-trip only |
| Warm instance | Run probes twice; record the second pass (first may include cold start) |
| Environment | Always note `local` vs `production` |

## Endpoints

| Method | Path | Notes |
|--------|------|-------|
| GET | `/health` | No DB; Phase 1+ |
| GET | `/properties` | Public catalog |
| POST | `/login` | Maps to `POST /auth/login` |

## Phase 0 — pre-deploy baseline (2026-07-01)

Recorded before Phase 1 (`performance-1`) ships to Render.

### Local (warm dev, user-reported)

```
POST /login 41 ms
GET /properties 182 ms
```

### Production (warm, probe rules above)

```
GET /health 291 ms
GET /properties 255 ms
POST /login 238 ms
```

Production Phase 0 signals: `/health` → 404, no `Cache-Control` or `Content-Encoding` on `/properties`.

## How to re-run

```bash
# Production (default)
node scripts/performance-baseline.mjs

# Local API
PERF_BASE_URL=http://localhost:3000 node scripts/performance-baseline.mjs
```

Append new sections per phase (`## Phase 1 — post-deploy`, `## Phase 2`, …) with date, git ref, and the same three lines.
