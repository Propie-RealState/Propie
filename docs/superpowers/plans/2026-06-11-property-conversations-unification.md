# Property Conversations Unification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the owner-agent modal stub and unify all messaging under Property Conversations with `PROPERTY_CLIENT` and `PROPERTY_INTERNAL` types in a single `/mensajes` inbox.

**Architecture:** Add `conversation_type` + `internal_agent_id` (dedicated participant identity; `assigned_agent_id` stays reserved for CRM/lead ownership). Extend existing repos/services — no new chat module.

**Tech Stack:** Fastify, PostgreSQL, React, Vitest

---

## Schema decision (approved)

| Field | Purpose |
|-------|---------|
| `conversation_type` | `PROPERTY_CLIENT` \| `PROPERTY_INTERNAL` |
| `client_id` | Required for CLIENT; null for INTERNAL |
| `internal_agent_id` | Agent participant in INTERNAL threads only |
| `assigned_agent_id` | **Unchanged** — future lead ownership / Propie Brain |

Partial unique indexes:
- `(property_id, client_id) WHERE conversation_type = 'PROPERTY_CLIENT'`
- `(property_id, internal_agent_id) WHERE conversation_type = 'PROPERTY_INTERNAL'`

---

## Task 1: Migration 033

**Files:**
- Create: `src/database/schemas/033-property-conversation-types.sql`
- Modify: `src/database/types/property-conversations.ts`

---

## Task 2: Backend types + repository

**Files:**
- Modify: `src/modules/property-conversations/types/property-conversation.types.ts`
- Modify: `src/modules/property-conversations/repositories/property-conversations.repository.ts`
- Modify: `src/modules/property-conversations/repositories/participants.repository.ts`
- Modify: `src/modules/property-conversations/utils/map-conversation.ts`
- Create: `src/modules/property-conversations/utils/resolve-conversation-presentation.ts`

---

## Task 3: Backend services + routes

**Files:**
- Create: `src/modules/property-conversations/services/start-internal-conversation.service.ts`
- Modify: `get-conversation.service.ts`, `list-conversations.service.ts`
- Modify: `schemas/property-conversation.schema.ts`
- Modify: `controllers/property-conversations.controller.ts`
- Modify: `routes/property-conversations.routes.ts`

**Endpoint:** `POST /property-conversations/internal` — body `{ propertyId, agentId? }` (agentId optional when caller is AGENT)

---

## Task 4: Frontend integration

**Files:**
- Modify: `web/.../types/property-conversation.types.ts`
- Modify: `web/.../services/property-conversations.service.ts`
- Modify: `EnabledAgentsSection.tsx` — `onOpenChat(agentId)`
- Modify: `PropertyDetails.tsx` — remove modal, wire navigation
- Modify: `ConversationListItem.tsx`, `ConversationThread.tsx`
- Modify: `conversation-role-ui.ts` — inbox label helpers

---

## Task 5: Tests

**Files:**
- Create: `tests/property-conversations/internal-conversation.test.ts`
- Modify: `tests/helpers/test-db.ts` — set `conversation_type` on fixtures

---

## Verification

```bash
npm test -- tests/property-conversations
```

Manual: Owner "Abrir chat" → `/mensajes/:id`; internal thread in inbox; client threads unchanged.
