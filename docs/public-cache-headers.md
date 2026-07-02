# Public cache headers (Phase 1 — Task 4)

Implementation: `src/lib/http/cache-headers.ts`

## Principles

| Rule | Rationale |
|------|-----------|
| Cache anonymous public reads | Catalog and profiles are safe to edge-cache briefly |
| Never cache authenticated catalog reads | `Authorization` changes agent-discovery filtering |
| Never cache user-specific routes | Favorites, profile, notifications, conversations, visits |
| `Vary: Authorization` on optional-auth routes | Prevents CDN serving agent-filtered JSON to anonymous clients |
| Health probes use `no-store` | Render must not cache liveness checks |

## Cached endpoints

| Endpoint | Policy (anonymous) | Policy (with `Authorization`) | TTL rationale |
|----------|-------------------|--------------------------------|---------------|
| `GET /health` | `no-store` | — | Probe must reflect live instance |
| `GET /properties` | `public, max-age=60, stale-while-revalidate=120` | `private, no-cache` + `Vary: Authorization` | Catalog changes often; SWR smooths spikes |
| `GET /properties/map` | same as `/properties` | same | Map pins derived from same catalog rules |
| `GET /properties/nearby` | same as `/properties` | same | Geo listing, same discovery semantics |
| `GET /properties/:id` | `public, max-age=30, stale-while-revalidate=60` | `private, no-cache` + `Vary: Authorization` | Detail visibility can differ per viewer |
| `GET /search` | `public, max-age=30, stale-while-revalidate=120` | `private, no-cache` + `Vary: Authorization` | Search is catalog-like; shorter TTL than list |
| `GET /geocoding/search` | `public, max-age=600, stale-while-revalidate=60` | — (no auth) | Nominatim-backed; stable suggestions |
| `GET /agents/users/:userId/public` | `public, max-age=300, stale-while-revalidate=60` | — | Fully public profile |
| `GET /agents/:agentId/profile` | same | — | Fully public profile |
| `GET /agents/:agentId/commercialized-properties` | same | — | Public agent portfolio |
| `GET /agents/users/:userId/published-properties` | same | — | Public published list |
| `GET /agents/users/:userId/reviews` | same | — | Public review list |
| `GET /agents/:agentId/reviews` | same | — | Legacy public review list |
| `GET /media/*` (legacy file) | `private, max-age=300` | — | Auth-gated binary; short private cache only |

## Explicitly not cached

| Area | Reason |
|------|--------|
| `POST /auth/*`, register, refresh | Auth/session mutations |
| `GET /properties/mine` | User-owned inventory |
| `GET /profile/me`, avatar upload | User-specific |
| Favorites, notifications, push | User-specific |
| Property conversations, visits | User-specific / permission-gated |
| Admin routes | Privileged |
| `GET /agents/users/:userId/can-review` | Authenticated eligibility check |
| Media redirects (302 signed URLs) | Per-request signed URL; no response cache on redirect |

## Rollback

Remove `apply*` calls from controllers and delete `src/lib/http/cache-headers.ts`.

## Verification

```bash
# Anonymous catalog — expect Cache-Control with max-age
curl -I https://propie-api.onrender.com/properties

# Authenticated catalog — expect private, no-cache
curl -I -H "Authorization: Bearer <token>" https://propie-api.onrender.com/properties

# Health — expect no-store
curl -I https://propie-api.onrender.com/health
```

Post-deploy baseline: record header presence in `docs/performance-baseline.md` Phase 1 section.
