# Property Owner Soft Delete — Design

## Goal

Only `properties.owner_id` can soft-delete a property. Agents, other owners, and admins cannot. Rows are never physically removed by this flow.

## Schema

- `deleted_at TIMESTAMPTZ NULL`
- `deleted_by UUID NULL REFERENCES users(id)`
- No `DELETED` lifecycle status (keeps commercialization status intact)
- No partial index in v1: active queries already filter by `status`/`published_at`; deleted set is small; `deleted_at IS NULL` is a cheap residual predicate

## Auth

- `assertIsPropertyOwner` — `owner_id` only (no admin bypass)
- Do not use `assertCanManageProperty` for delete

## API

`DELETE /properties/:id` (auth required)

| Case | Status |
|------|--------|
| Success | 204 |
| Already deleted (owner) | 204 idempotent |
| Not owner | 403 |
| Missing | 404 |
| Unauthenticated | 401 |

Sets `deleted_at = now()`, `deleted_by = user.id`.

## Guards

- `notDeletedSql(alias)` folded into explore/operations SQL helpers
- `canViewProperty` / manage checks treat deleted as inaccessible
- Mutations that create new activity rejected once deleted
- Historical rows preserved; future restore = clear `deleted_at`/`deleted_by` (out of scope)

## Frontend

Delete action only when `access_type === 'OWNER'` (or `ownerId === currentUser.id`). No archive/restore UI.
