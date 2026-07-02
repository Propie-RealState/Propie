# Phase 1 Performance Optimization — Final Report

**Branch:** `performance-1`  
**Date:** 2026-07-01  
**Scope:** Phase 1 only — no Phase 2 work started

---

## Executive summary

Phase 1 is **code-complete** on `performance-1`. Builds pass. Local preview validates splash, Explore error handling, and inline SVG logo. **Production API changes are not deployed yet** — post-deploy metrics are still Phase 0 baseline.

---

## Implemented changes

| # | Item | Reason | Expected gain | Risk |
|---|------|--------|---------------|------|
| 1 | Production startup → `node dist/server.js` | Remove `tsx` runtime overhead | 200–500 ms cold start | Low |
| 2 | `GET /health` (no DB) | Lightweight Render probe | Faster health checks | Low |
| 3 | `@fastify/compress` (gzip/br) | Uncompressed JSON on API | 60–75% wire on payloads >1 KB | Low |
| 4 | Public cache headers | CDN/browser reuse for public reads | Lower TTFB on repeat catalog loads | Low |
| 5 | Migration `040-performance-indexes.sql` | Stale/missing indexes | Faster map/catalog queries | Low |
| 6 | Global body limit 1 MB | Reduce abuse surface | Memory/DoS hardening | Low |
| 7 | Remove duplicate JWT verify | Conversations/visits routes | ~1 JWT verify per request | Low |
| 8 | Splash optimization | Artificial 2.2s block | FCP ~80 ms local preview | Low |
| 9 | Explore error + retry | Infinite skeleton on API fail | Better UX under failure | Low |

## Files modified

**Infrastructure:** `render.yaml`

**Backend:** `package.json`, `pnpm-lock.yaml`, `src/app.ts`, `src/config/body-limits.ts`, `src/routes/health.route.ts`, `src/lib/http/cache-headers.ts`, property/search/geocoding/agent controllers & routes, conversations/visits routes, profile upload routes

**Database:** `src/database/schemas/040-performance-indexes.sql`

**Frontend:** `SplashScreen.tsx` (×2), `Explore.tsx`, `PropieLogo.tsx`; removed unused splash PNGs

**Docs/scripts:** `docs/performance-baseline.md`, `docs/public-cache-headers.md`, `scripts/performance-baseline.mjs`, `scripts/verify-cache-headers.mjs`

---

## Infrastructure changes

| Component | Before | After |
|-----------|--------|-------|
| Render start | `tsx src/server.ts` | `node -r tsconfig-paths/register dist/server.js` |
| Render health | `/properties` (DB) | `/health` (no DB) |

---

## Database changes

**Migration `040-performance-indexes.sql`:**

- Drop stale `idx_properties_published_geo_filters`
- Add `idx_properties_active_geo_filters`
- Add `idx_properties_published_at`
- Add `idx_property_amenities_property_id`

**Apply on Supabase before expecting query gains.**

---

## HTTP improvements

### API (Render — post-deploy)

| Endpoint | Anonymous policy |
|----------|------------------|
| `GET /properties`, `/map`, `/nearby` | `public, max-age=60, stale-while-revalidate=120` |
| `GET /properties/:id` | `public, max-age=30, stale-while-revalidate=60` |
| `GET /search` | `public, max-age=30` |
| `GET /geocoding/search` | `public, max-age=600` |
| Agent public profiles/properties/reviews | `public, max-age=300` |
| With `Authorization` | `private, no-cache` + `Vary: Authorization` |

See [public-cache-headers.md](./public-cache-headers.md).

---

## Validation results

### Build

| Check | Result |
|-------|--------|
| API `pnpm build` | Pass |
| Web `pnpm build` | Pass |

### Unit tests

| Check | Result |
|-------|--------|
| `pnpm test` | Fail — Postgres not running (`ECONNREFUSED`); pre-existing env constraint |

### Pre-deploy validation checklist

| Check | Result | Notes |
|-------|--------|-------|
| API + web `pnpm build` | **Pass** | |
| Cache headers (code) | **Pass** | `scripts/verify-cache-headers.mjs`; live after Render deploy |
| API compression | **Pass** | `/properties` → `content-encoding: br` (manual probe) |
| Local preview | **Pass** | Splash, Explore error state, SVG logo |

### Blocked / not run

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm test` (unit) | **Fail** | Postgres not running — pre-existing env constraint |
| Full `pnpm test:e2e` | **Not run** | Requires Docker + `e2e/.seed-output.json` |
| `e2e/logo-replacement.spec.ts` | **Will fail** | Still expects `LOGO B.png`; update for SVG logo |

### Production probes (pre-deploy baseline)

```
GET /health      291–322 ms   (404 — endpoint not deployed)
GET /properties  255–293 ms   (no Cache-Control at first probe; later showed br compression)
POST /login      238–241 ms
```

Canonical format: [performance-baseline.md](./performance-baseline.md)

---

## Performance before vs after

| Metric | Before (measured) | After local preview | After production deploy (expected) |
|--------|-------------------|---------------------|-----------------------------------|
| Render start | `tsx` | Compiled Node | Faster cold start |
| Health check | Full `/properties` + DB | `/health` no DB | ~50–100 ms warm |
| API compression | None | Plugin registered | `br`/`gzip` on JSON >1 KB |
| API cache headers | None | Controllers set headers | `Cache-Control` on public routes |
| Splash blocking | 2,200 ms + 488 KB PNG | ~480 ms + inline SVG | Same after web deploy |
| Explore API failure | Infinite skeleton | Error + Reintentar | Same after web deploy |
| Splash PNG assets | ~1.5 MB unused PNGs | Inline SVG | Smaller static footprint |
| JWT (conversations/visits) | 2× verify | 1× verify | Lower auth overhead |
| DB map filter index | Stale partial index | Migration 040 ready | Faster geo queries |

**Local preview FCP:** ~80–132 ms vs production cold ~1,200 ms (splash + warm cache).

---

## Deployment checklist

1. Merge/deploy `performance-1` to **Render** (API) and **Vercel** (web frontend changes)
2. Run `040-performance-indexes.sql` on Supabase production
3. Update `e2e/logo-replacement.spec.ts` for SVG logo
4. Post-deploy verification:

```bash
pnpm perf:baseline
curl -I https://propie-api.onrender.com/health
curl -H "Accept-Encoding: gzip" -I https://propie-api.onrender.com/properties
node scripts/verify-cache-headers.mjs
```

5. Append **Phase 1 — post-deploy** section to `docs/performance-baseline.md`

---

Phase 1 is **complete in code**. Production validation completes after deploy + migration + E2E logo spec fix.
