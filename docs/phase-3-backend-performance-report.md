# Phase 3 — Backend Scalability Optimization Report

**Scope:** Backend performance, PostgreSQL efficiency, API scalability, request execution.
**Constraint:** Preserve architecture, features, UI and workflows. No Redis / no external
search / no infra migration (deferred to Phase 4).
**Stack:** Fastify 5, node-postgres (`pg` 8), PostgreSQL 16 + PostGIS, Supabase Storage, Sharp, JWT.

---

## 1. Executive Summary

Phase 1 already delivered the bulk of the index coverage, HTTP cache headers, an in-process
signed-URL cache, and a media-auth cache. Phase 3 closed the remaining structural gaps that
bite at scale (thousands of listings, concurrent users) **without changing any response
contract or workflow**:

| # | Optimization | Type | Risk |
|---|--------------|------|------|
| 1 | Explicit connection-pool sizing + lifecycle + pool error guard | Config | Very low |
| 2 | Publish side-effects (geocoding, notifications) moved off the critical path | Latency | Low |
| 3 | Media authorization no longer runs the heavy property-detail query | DB load | Low |
| 4 | `findPropertyById` rewrite: removed image×video cartesian + `GROUP BY` | DB CPU | Low |
| 5 | Opt-in, backward-compatible pagination + stable ordering on `/properties` | Payload | Very low |
| 6 | Targeted composite/partial indexes (migration `042`) | DB | Very low (additive) |

**Verification:** `tsc` clean, **234/234 tests pass**, API booted against local Postgres and
all changed endpoints validated over HTTP (contract preserved, pagination stable).

---

## 2. Architecture Findings (via Graphify)

- Clean modular monolith: `controllers → services → repositories → db pool`. No import cycles.
- God-nodes: `db` (61 edges), `assertCanManageProperty`, `getPropertyByIdRepository`,
  `findVisitByIdRepository`, notification dispatch. These are the correct places to optimize.
- `db` (the single `pg.Pool`) is the central bridge — pool tuning is the highest-leverage,
  lowest-risk change.
- Media authorization was coupled to the full property-detail service — a cross-community
  dependency that forced the heaviest read query onto every uncached `/media/*` request.

---

## 3. Repository Findings

- **`findPropertyByIdRepository`** was the only genuinely expensive detail query. It
  `LEFT JOIN`ed `property_images` **and** `property_videos` then de-duplicated with
  `json_agg(DISTINCT …)` + a 7-column `GROUP BY`. That produces an images×videos cartesian
  product that Postgres must materialize, sort and dedupe. Rewritten so images/videos are
  independent ordered scalar subqueries → **no cartesian, no top-level GROUP BY, no dedupe sort.**
- The owner/agent review aggregations (`ors`, `opc`, `ars`) *looked* like whole-table
  `GROUP BY`s, but `EXPLAIN ANALYZE` shows Postgres **pushes the join predicate down**
  (`target_user_id = p.owner_id`, `owner_id = p.owner_id`) into a bitmap/filtered scan. Left
  as-is — rewriting would add complexity for no measurable gain (Caveman: rejected).
- **List queries** (`getPropertiesRepository`, `getMyPropertiesRepository`) returned
  everything unbounded. Added opt-in pagination + stable ordering to `/properties` (the public,
  high-traffic feed). `/properties/mine` is per-user bounded and low risk; left unpaged.
- **Known N+1 (documented, not changed):** `notifyPropertyConversationMessage` calls
  `getNotificationPreferencesRepository` once per recipient in a loop. It is already off the
  request's response value; batching it is a Phase 4 follow-up (see §11).

---

## 4. Database Findings

- Index coverage from Phase 1 (`040-performance-indexes.sql`) is already strong across
  properties, locations (GiST), conversations, visits, favorites, reviews, notifications.
- **Added (`042-phase3-scalability-indexes.sql`, additive/idempotent):**
  - `idx_property_images_cover` — partial `(property_id) WHERE is_cover = true`; single-probe
    cover lookup for explore / my-properties joins.
  - `idx_property_images_property_order` — `(property_id, display_order, created_at)`; feeds the
    ordered media subqueries and the map cover LATERAL without a sort.
  - `idx_agent_applications_property_status` — `(property_id, status)`; detail "agents"
    subquery + getMyProperties EXISTS.
  - `idx_property_favorites_user_created` — `(user_id, created_at DESC)`; favorites listing /
    keyset-pagination ready.
- **`EXPLAIN ANALYZE`** confirmed: old detail plan had a top-level `GroupAggregate` + quicksort
  over the image×video product; new plan is a plain `Nested Loop Left Join` with media pulled by
  bounded subplans. (Dataset is only 38 properties, so wall-clock is sub-ms today; the win is the
  removal of a super-linear step that grows with `images × videos` per property.)

---

## 5. Media Findings

- `authorizeMediaAccess` cache (Phase 1) + in-process signed-URL cache (Phase 1) already avoid
  Supabase round-trips on repeat hits.
- **Phase 3 fix:** on a cache miss, media auth called `findPropertyByIdService` (the full detail
  graph) merely to answer "can this viewer see it?". Replaced with:
  - `getPropertyAccessRowRepository` — 5-column projection (`id, status, owner_id, publisher_id,
    published_at`).
  - shared `canViewProperty` / `canViewPropertyById` predicate (extracted so detail-view and
    media-auth stay consistent).
  - Result: every uncached media authorization is now one lightweight indexed lookup
    (+ an EXISTS manage-check only for non-public assets) instead of the heaviest query in the app.

---

## 6. API Findings

- `/properties` now accepts optional `limit` (1–100) and `offset` (≥0).
  - **Omitted → identical legacy behavior** (full array). Backward compatible; the current
    frontend (Explore/Favorites/Map share this query) is unaffected.
  - **Provided → same array shape, bounded.** Clients can adopt paging with no new envelope.
  - Stable ordering: `ORDER BY created_at DESC, id DESC` (id tiebreaker) so pages never overlap
    or skip when timestamps collide.
- Payload review: explore list already returns a lean projection (no descriptions/blobs). Detail
  returns `p.*` + related aggregates — kept intact to preserve the contract; field-level slimming
  would be a breaking change and is deferred.

---

## 7. Scalability Findings — Connection Pool

`src/database/client/pool.ts` now sets explicit, documented sizing:

| Option | Value | Rationale |
|--------|-------|-----------|
| `max` | `DB_POOL_MAX` or **10** | Node is single-threaded; a large pool only adds Postgres/Supabase contention. Tunable per env. |
| `min` | `0` | Release idle connections under low traffic (Supabase caps total connections). |
| `idleTimeoutMillis` | `30000` | Reap idle clients. |
| `connectionTimeoutMillis` | `5000` | Fail fast instead of piling up requests. |
| `maxUses` | `7500` | Recycle a connection periodically to bound per-connection drift. |
| `maxLifetimeSeconds` | `1800` | Cap physical connection age so pooled clients don't outlive server-side resets. |

Added a `pool.on('error')` guard so a dropped idle backend logs instead of crashing the process.

---

## 8. Performance Measurements (local, 38 properties)

Small dataset ⇒ times are dominated by Node/HTTP overhead and DB is sub-ms; numbers validate
**correctness and structure**, not scale. Structural gains materialize at thousands of rows.

| Metric | Before | After | Notes |
|--------|--------|-------|-------|
| `/properties` (HTTP, warm) | ~11–12 ms | ~11–12 ms | unchanged at this size; now bounded + stable-ordered |
| Property detail SQL plan | GroupAggregate + quicksort over img×vid product | Nested Loop + bounded subplans | removes super-linear step |
| Property detail (HTTP) | 200 OK | 200 OK, contract identical | keys: images, videos, media, owner_info, allow_chat, accepts_agent_participation, publisher_info, agents |
| Media auth (uncached) | full detail query | 5-col lookup (+EXISTS) | large DB-load reduction per media request |
| Publish response | geocode(external, rate-limited) + notify **in path** | side-effects deferred | faster, identical end-state |

### Before vs After — behavior contracts
- `/properties` (no params): **24 items** before and after (identical).
- `/properties?limit=2` → 2 items; `offset=2` → next 2, **non-overlapping** (stable).
- `/properties/:id`: all response keys preserved; `images=1, videos=0, media=1` correct.

---

## 9. Playwright / Regression Results

- **Automated suite: 234/234 passing** (34 files) — includes auth, property lifecycle, media
  capability-token authorization, conversations, visits, notifications, rate-limit.
- The media capability-token test exercises the **new lightweight auth path** and passes
  (auth succeeds, then hits the expected fake-storage signed-URL error — proving authorization
  is reached correctly).
- **Runtime HTTP validation** performed against local Postgres for Explore list, pagination, and
  Property Detail (see §8).
- Full cross-viewport Playwright MCP runs (Explore / Detail / Publish / Favorites / Chats /
  Visits / Search / Profile / Map on desktop/tablet/mobile) require the full frontend + Supabase
  stack running; the backend changes are contract-preserving and covered by the passing suite +
  HTTP validation. Recommended as a pre-merge gate on a full staging environment.

---

## 10. Search Findings & FTS Readiness

Global search uses `LIKE '%term%'` over accent-normalized expressions across properties,
locations and users. Correct and fine at current volume, but leading-wildcard `LIKE` cannot use
a btree index → sequential scans that grow linearly with table size.

**Decision:** do **not** add trigram/FTS machinery now (38 rows; premature — Caveman rejected).
**Readiness blueprint for when property/user counts justify it (no external engine):**
1. `CREATE EXTENSION pg_trgm;`
2. Wrap the normalizer in an `IMMUTABLE` SQL function so it is index-safe.
3. `GIN (normalized_expr gin_trgm_ops)` indexes on the hot columns (title, city, province,
   neighborhood, address, name) — accelerates the existing `LIKE` queries **with zero app
   changes**.
4. Only if ranking/relevance is needed: add a generated `tsvector` column + GIN and switch the
   match clause to `@@ websearch_to_tsquery`.

---

## 11. Scalability Review (10 → 10,000 users)

| Users | Assessment | Limiting factor |
|-------|------------|-----------------|
| **10** | Comfortable. | None. |
| **100** | Comfortable. | HTTP caching + signed-URL cache absorb read bursts. |
| **1,000** | Healthy with Phase 3. | Pool (max 10) may need bumping under write bursts; publish is now fast (side-effects deferred). |
| **10,000** | Read path scales (indexes, pagination, lightweight media auth, caches). | Remaining risks below. |

**Remaining risks / Phase 4 candidates:**
- Background side-effects are `setImmediate` (at-most-once, in-process). At high write volume,
  promote to a durable job runner (still no Redis required — a DB-backed outbox works).
- `notifyPropertyConversationMessage` preference lookup is N+1 → batch into one `IN (...)` query.
- Fan-out notifications (`findUsersNearProperty`, favorites) should be chunked/batched at scale.
- Search: enable the `pg_trgm`/FTS blueprint (§10) when volume warrants.
- Pool sizing beyond a single instance / read replicas → Phase 4 infra.
- Frontend can adopt the new `limit`/`offset` for true incremental loading on Explore.

---

## 12. Estimated Improvement & Readiness Score

- **Property detail:** removes a super-linear (`images × videos`) sort/dedupe step — increasingly
  significant per listing with rich media.
- **Media requests:** heaviest query removed from the (uncached) authorization path — the biggest
  per-request DB-load reduction in this phase.
- **Publish:** response no longer blocks on an external, rate-limited geocoder or notification
  fan-out.
- **Explore:** bounded, stable pagination available; unbounded worst-case payload eliminated for
  paging clients.

**Production readiness score: 8.5 / 10** for an MVP→marketplace transition. Read path is
scale-ready to ~10k users; the gap to 9.5+ is durable background processing and search FTS
(Phase 4), not correctness.

---

## 12b. Keyset (Cursor) Pagination — Final Optimization

### Why cursor pagination was adopted
`LIMIT/OFFSET` must scan and discard every row before the offset, so page cost
grows linearly with depth (`OFFSET 10000` reads 10,000 rows to return 20). Worse,
with a live feed ordered by `created_at DESC`, any insert/delete between requests
shifts every subsequent row — clients see **duplicated or skipped** records while
scrolling. Keyset (cursor) pagination fixes both.

### Advantages over OFFSET
| | OFFSET | Keyset cursor |
|---|--------|---------------|
| Deep-page cost | O(offset) — scans skipped rows | O(log n) index seek, constant per page |
| Concurrent insert/delete | duplicates / skips rows | stable — rows never shift across pages |
| Index usage | sort + discard | direct row-value seek on `(created_at, id)` |
| Correctness on duplicate timestamps | position-based, fragile | total order via `(created_at, id)` tiebreaker |

### Design
- **Ordering:** unchanged — `ORDER BY created_at DESC, id DESC`.
- **Predicate:** row-value comparison `(created_at, id) < (cursorCreatedAt, cursorId)`
  — never `created_at` alone, so timestamp ties can't skip/duplicate.
- **Cursor:** opaque, base64url-encoded `{c: created_at, i: id}` (`src/database/shared/cursor.ts`).
  Clients treat it as a black box. Malformed/tampered cursors are rejected with **400**.
- **Fetch limit + 1** internally to derive `hasMore` without a `COUNT`.
- **Response envelope:** `{ items, nextCursor, hasMore }`.

### API modes (`GET /properties`) — backward compatible
| Request | Mode | Response shape |
|---------|------|----------------|
| no params | legacy default | bare array (unchanged — current frontend) |
| `offset` present | legacy OFFSET (deprecated, temporary) | bare array |
| `limit` and/or `cursor` (no `offset`) | **keyset (preferred)** | `{ items, nextCursor, hasMore }` |

First keyset page: `GET /properties?limit=20` → returns `nextCursor`.
Next page: `GET /properties?limit=20&cursor=<nextCursor>`. Repeat until `hasMore=false`.

### Migration path
1. **Now:** existing clients keep working untouched (no params → full array).
2. **Adopt:** new/updated clients call with `limit` (+ echo `nextCursor`) and read the
   envelope. No coordinated deploy required.
3. **Deprecate:** once no client sends `offset`, remove the legacy OFFSET branch
   (`getPropertiesRepository` limit/offset path) in a later release.

### Database verification (`EXPLAIN ANALYZE`)
- Added `idx_properties_explore_keyset` — partial `(created_at DESC, id DESC)
  WHERE published_at IS NOT NULL AND status IN (...)` (migration `043`).
- With the planner allowed to prefer indexes, the keyset query runs entirely on
  **index scans** (`properties_pkey` for the DISTINCT ON, `idx_property_images_cover`,
  `property_locations_pkey`) — **no sequential scans**. At the current 38-row size
  Postgres correctly still prefers a seq scan (cheaper for tiny tables); the index is
  in place for scale.
- Note: the explore feed's `DISTINCT ON (p.id)` dedupe means the outer keyset order
  is a bounded top-N heapsort over the deduped set rather than a pure index walk —
  acceptable and far cheaper than OFFSET at depth.

### Validation results (live HTTP + SQL)
- **First / middle / last page:** paged all 24 rows in 5 pages (5,5,5,5,4);
  `hasMore` true until the final page.
- **No duplicates / no skips:** 24 unique ids == legacy full-array count.
- **Duplicate timestamps:** controlled 4-way tie paged as 4→3→2→1→5 with zero
  dupes/skips across the tie boundary.
- **Deleted records:** when the cursor's own row is deleted, paging continues
  correctly (value comparison is position-independent).
- **Concurrent inserts:** a newer row (higher `created_at`) only appears at the head
  and never shifts already-returned pages — the core keyset guarantee.
- **Malformed cursor → 400.** Legacy `offset` mode still returns a bare array.

## 13. Files Changed

- `src/database/client/pool.ts` — explicit pool sizing + lifecycle + error guard.
- `src/lib/async/run-in-background.ts` — deferred side-effect helper (new).
- `src/modules/properties/services/publish-property.service.ts` — defer geocode + notify.
- `src/modules/properties/services/update-property-status.service.ts` — defer notify.
- `src/modules/properties/repositories/property-read.repository.ts` — detail rewrite,
  `getPropertyAccessRowRepository`, opt-in pagination + stable order.
- `src/modules/properties/services/can-view-property.ts` — shared view predicate (new).
- `src/modules/properties/services/find-property-by-id.service.ts` — use shared predicate.
- `src/modules/media/services/media-access.service.ts` — lightweight authorization.
- `src/modules/properties/services/get-properties.service.ts` +
  `controllers/property-discovery.controller.ts` — pagination plumbing.
- `src/database/schemas/042-phase3-scalability-indexes.sql` — targeted indexes (new).
- `src/database/shared/cursor.ts` — opaque keyset cursor codec + page builder (new).
- `src/database/schemas/043-explore-keyset-index.sql` — keyset ordering index (new).
- `src/modules/properties/repositories/property-read.repository.ts` —
  `getPropertiesKeysetRepository` (keyset variant).
- `src/modules/properties/services/get-properties.service.ts` —
  `getPropertiesKeysetService`.
- `src/modules/properties/controllers/property-discovery.controller.ts` — mode
  selection (legacy array / offset / keyset envelope) + cursor validation.
