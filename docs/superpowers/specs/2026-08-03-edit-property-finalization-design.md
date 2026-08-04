# Edit Property Finalization — Design

**Date:** 2026-08-03  
**Branch:** `audit/edit-property-flow-rca`  
**Status:** Approved for implementation

## Problem

Create and Edit share one publish wizard. Steps 1–4 persist via PATCH. Step 5 always called `PATCH /properties/:id/publish`. For already-published properties the API returns `409 ALREADY_PUBLISHED`; the client swallowed the error, so saves succeeded but the UX never completed.

## Domain model

| Lifecycle op | Meaning | API |
|---|---|---|
| Publish | First-time `published_at` stamp | `PATCH …/publish` |
| Edit finalize | Confirm incremental saves already done | No re-publish |

## Architecture

Keep the shared wizard. Introduce a **wizard finalization strategy** resolved from `publishMode`:

```
Property Wizard (shared)
  Steps 1–4 → PATCH saves (unchanged)
  Step 5 → resolveWizardFinalization(publishMode).finalize(propertyId)
```

- `publish` strategy: call `publishProperty()` (analytics inside that service), create success copy
- `save_edits` strategy: no-op network finalize (data already persisted), edit success copy

Step 5 orchestrates checklist, loading, errors, and success modal; it does not hardcode publish.

## Non-goals

- No backend contract change / no idempotent publish
- No duplicate wizard or Step components
- No React Query introduction

## UX

| | Create | Edit |
|---|---|---|
| CTA | Publicar propiedad | Guardar cambios |
| Success | ¡Tu propiedad ya está online! | Los cambios se guardaron correctamente. |
| Loading | CTA busy while finalizing | same |
| Errors | `showToast` | same |
| Analytics | `PROPERTY_PUBLISHED` on success | must not fire |
