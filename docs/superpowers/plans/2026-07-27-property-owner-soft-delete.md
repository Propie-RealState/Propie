# Property Owner Soft Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or execute task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Owner-only soft delete via `deleted_at`/`deleted_by`, hide from active inventory, block mutations.

**Architecture:** Dedicated owner assert + DELETE endpoint; shared `notDeletedSql` in listing helpers; manage/view paths reject deleted rows. No DELETED status. No restore.

**Tech Stack:** Fastify, Postgres SQL migrations, Vitest inject tests, React My Properties UI, Playwright.

## Global Constraints

- Owner = `properties.owner_id` only; no admin bypass on delete
- Soft delete only; preserve history
- No breaking enum/status changes
- Minimal blast radius; reuse existing patterns

---

### Task 1: Schema

- [ ] Add `src/database/schemas/044-property-soft-delete.sql`
- [ ] Columns: `deleted_at`, `deleted_by` FK users; skip partial index (documented)

### Task 2: Shared SQL + view/manage guards

- [ ] Add `notDeletedSql(alias)` to `property-status.constants.ts`; fold into explore/operations helpers
- [ ] Extend access row + `canViewProperty` for `deleted_at`
- [ ] `canManageProperty` requires `deleted_at IS NULL`
- [ ] `getMyProperties` excludes deleted
- [ ] Favorites / other list queries exclude deleted

### Task 3: Delete API (TDD)

- [ ] Failing Vitest for owner/agent/other/anon/404/idempotent
- [ ] `assertIsPropertyOwner`, soft-delete service/repo/controller/route
- [ ] Tests green

### Task 4: Frontend

- [ ] Delete service + owner-gated control on My Properties / PropertyManagementRow
- [ ] Refetch or remove from list after success

### Task 5: E2E

- [ ] Playwright desktop + mobile smoke for owner delete / agent no Delete
