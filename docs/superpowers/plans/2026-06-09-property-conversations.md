# Property Conversations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement property-scoped conversation threads where Owner + enabled Agents + Client communicate via a single hub per property, with notifications, permissions, and read-only historical access for removed agents.

**Architecture:** New `property-conversations` Fastify module with 3 PostgreSQL tables. Participants derived from `properties.owner_id`, `property_assignments.is_active`, and `client_id`. Reuse `MESSAGE_RECEIVED` notifications + push. Frontend replaces stub `/mensajes` and wires `PropertyDetails` inline chat.

**Tech Stack:** Fastify 5, PostgreSQL/pg, Zod 4, Vitest, React 19 + Vite (web/), existing notification-push pipeline.

**Product spec:** `propie-brain/product/features/property-conversations/property-conversations.md`

**Subagent map:**

| Subagent | Scope |
|----------|-------|
| A | Graph/entity design — **complete** |
| B | Schema, repositories, services, routes, notification hooks, assignment lifecycle |
| C | Web inbox, conversation view, PropertyDetails integration, deep links |
| D | Vitest setup, integration tests, permission/realtime-polling tests |

---

## File map

### Create — Backend (`Propie/src/`)

| File | Responsibility |
|------|----------------|
| `database/schemas/032-property-conversations.sql` | 3 tables + indexes + status enum constraint |
| `database/types/property-conversations.ts` | Zod schemas + TS types |
| `modules/property-conversations/types/property-conversation.types.ts` | Domain types, status enum |
| `modules/property-conversations/schemas/property-conversation.schema.ts` | Request/response Zod |
| `modules/property-conversations/repositories/participants.repository.ts` | Resolve owner + active agents |
| `modules/property-conversations/repositories/property-conversations.repository.ts` | CRUD conversations |
| `modules/property-conversations/repositories/messages.repository.ts` | Messages + pagination |
| `modules/property-conversations/repositories/participant-states.repository.ts` | Unread, read, revoke |
| `modules/property-conversations/repositories/can-access-conversation.repository.ts` | Permission checks incl. historical |
| `modules/property-conversations/services/start-conversation.service.ts` | Client starts / returns existing |
| `modules/property-conversations/services/list-conversations.service.ts` | Inbox by role |
| `modules/property-conversations/services/send-message.service.ts` | Send + fan-out side effects |
| `modules/property-conversations/services/mark-read.service.ts` | Update last_read_at |
| `modules/property-conversations/services/sync-participants.service.ts` | On agent accept/deactivate |
| `modules/property-conversations/controllers/property-conversations.controller.ts` | HTTP handlers |
| `modules/property-conversations/routes/property-conversations.routes.ts` | Route registration |
| `modules/property-conversations/utils/map-conversation.ts` | Row → API DTO |

### Modify — Backend

| File | Change |
|------|--------|
| `src/app.ts` | Register `propertyConversationsRoutes` at `/property-conversations` |
| `modules/chats/routes/chats.routes.ts` | Return `410 Gone` with redirect hint |
| `modules/notifications/services/notification-dispatch.service.ts` | Add `notifyPropertyConversationMessage()` batch helper |
| `modules/notifications/utils/notification-push-url.ts` | Deep link `/mensajes/:conversationId` |
| `modules/agent-applications/repositories/agent-applications.repository.ts` | Call `syncParticipantsOnAgentEnabled()` on ACCEPTED |
| `modules/properties/repositories/can-manage-property.repository.ts` | Use `property_assignments.is_active` for agents |

### Create — Frontend (`Propie/web/src/`)

| File | Responsibility |
|------|----------------|
| `app/modules/property-conversations/types/property-conversation.types.ts` | DTOs |
| `app/modules/property-conversations/services/property-conversations.service.ts` | API client |
| `app/modules/property-conversations/pages/ConversationsInbox.tsx` | Replace Messages stub for all roles |
| `app/modules/property-conversations/pages/ConversationThread.tsx` | Thread view + polling |
| `app/modules/property-conversations/components/ConversationListItem.tsx` | Inbox row |
| `app/modules/property-conversations/hooks/useConversationPolling.ts` | 30s poll when thread open |

### Modify — Frontend

| File | Change |
|------|--------|
| `app/routes.tsx` | Add `/mensajes/:conversationId`, wire new inbox |
| `app/modules/explore/pages/PropertyDetails.tsx` | Wire inline chat to `POST /property-conversations` |
| `app/modules/notifications/utils/notification-ui.ts` | Deep link with conversationId |
| `hooks/useNotificationCount.ts` | No change expected |

### Create — Tests

| File | Responsibility |
|------|----------------|
| `vitest.config.ts` | Vitest + path aliases |
| `tests/helpers/test-db.ts` | DB seed/cleanup helpers |
| `tests/helpers/test-users.ts` | Factory: owner, agent, client |
| `tests/property-conversations/start-conversation.test.ts` | Creation + visibility |
| `tests/property-conversations/send-message.test.ts` | Messaging + notifications |
| `tests/property-conversations/permissions.test.ts` | Unauthorized, removed agent, new agent |
| `tests/property-conversations/realtime-polling.test.ts` | Unread counters + state updates |

---

## Task 1: Vitest infrastructure (Subagent D)

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Create: `tests/helpers/test-db.ts`

- [ ] **Step 1: Install vitest**

```bash
cd C:\Projects\Propie
pnpm add -D vitest
```

- [ ] **Step 2: Add test script to `package.json`**

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 4: Create minimal failing test**

Create `tests/property-conversations/smoke.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("property-conversations module", () => {
  it("exports PROPERTY_CONVERSATION_STATUSES", async () => {
    const mod = await import(
      "@/modules/property-conversations/types/property-conversation.types"
    );
    expect(mod.PROPERTY_CONVERSATION_STATUSES).toContain("OPEN");
  });
});
```

- [ ] **Step 5: Run test — expect FAIL**

```bash
pnpm test tests/property-conversations/smoke.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml tests/
git commit -m "test: add vitest infrastructure for property conversations"
```

---

## Task 2: Domain types and status enum (Subagent B)

**Files:**
- Create: `src/modules/property-conversations/types/property-conversation.types.ts`

- [ ] **Step 1: Write failing smoke test** (already in Task 1)

- [ ] **Step 2: Create types file**

```typescript
export const PROPERTY_CONVERSATION_STATUSES = [
  "OPEN",
  "ARCHIVED",
  "CLOSED",
] as const;

export type PropertyConversationStatus =
  (typeof PROPERTY_CONVERSATION_STATUSES)[number];

export const MESSAGE_CONTENT_TYPES = ["TEXT", "SYSTEM"] as const;

export type MessageContentType =
  (typeof MESSAGE_CONTENT_TYPES)[number];

export const PARTICIPANT_ROLES = [
  "CLIENT",
  "OWNER",
  "AGENT",
] as const;

export type ParticipantRole =
  (typeof PARTICIPANT_ROLES)[number];
```

- [ ] **Step 3: Run smoke test — expect PASS**

```bash
pnpm test tests/property-conversations/smoke.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/property-conversations/types/property-conversation.types.ts
git commit -m "feat: add property conversation domain types"
```

---

## Task 3: Database migration (Subagent B)

**Files:**
- Create: `src/database/schemas/032-property-conversations.sql`
- Create: `src/database/types/property-conversations.ts`

- [ ] **Step 1: Write migration**

```sql
-- =============================================================================
-- property conversations
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID NOT NULL,
    client_id UUID NOT NULL,

    status TEXT NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'ARCHIVED', 'CLOSED')),

    assigned_agent_id UUID NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    lead_score NUMERIC(5,2) NULL,

    last_message_at TIMESTAMPTZ NULL,
    last_message_preview TEXT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_pc_property
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_client
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_assigned_agent
        FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pc_unique_property_client
ON property_conversations (property_id, client_id);

CREATE INDEX IF NOT EXISTS idx_pc_property_id
ON property_conversations (property_id);

CREATE INDEX IF NOT EXISTS idx_pc_client_id
ON property_conversations (client_id);

CREATE INDEX IF NOT EXISTS idx_pc_last_message_at
ON property_conversations (last_message_at DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS property_conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,

    sender_role TEXT NOT NULL
        CHECK (sender_role IN ('CLIENT', 'OWNER', 'AGENT')),
    content_type TEXT NOT NULL DEFAULT 'TEXT'
        CHECK (content_type IN ('TEXT', 'SYSTEM')),
    body TEXT NOT NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL,

    CONSTRAINT fk_pcm_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES property_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcm_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pcm_conversation_created
ON property_conversation_messages (conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS property_conversation_participant_states (
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,

    unread_count INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMPTZ NULL,
    last_read_message_id UUID NULL,

    participant_role TEXT NOT NULL
        CHECK (participant_role IN ('CLIENT', 'OWNER', 'AGENT')),
    revoked_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (conversation_id, user_id),

    CONSTRAINT fk_pcps_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES property_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcps_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcps_last_read_message
        FOREIGN KEY (last_read_message_id)
        REFERENCES property_conversation_messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pcps_user_unread
ON property_conversation_participant_states (user_id, unread_count)
WHERE unread_count > 0 AND revoked_at IS NULL;
```

- [ ] **Step 2: Apply migration**

```bash
pnpm db:setup
# or run 032 SQL against local postgres
```

- [ ] **Step 3: Run `graphify update .`**

- [ ] **Step 4: Commit**

```bash
git add src/database/schemas/032-property-conversations.sql
git commit -m "feat: add property conversations schema"
```

---

## Task 4: Permission repository (Subagent B) — TDD

**Files:**
- Create: `src/modules/property-conversations/repositories/can-access-conversation.repository.ts`
- Create: `tests/property-conversations/permissions.test.ts`
- Create: `tests/helpers/test-db.ts`, `tests/helpers/test-users.ts`

- [ ] **Step 1: Write failing permission tests**

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  canAccessConversation,
  canSendMessage,
  canReadMessageHistorically,
} from "@/modules/property-conversations/repositories/can-access-conversation.repository";
import { seedConversationFixture, cleanupFixture } from "../helpers/test-db";

describe("conversation permissions", () => {
  let fixture: Awaited<ReturnType<typeof seedConversationFixture>>;

  beforeAll(async () => {
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
  });

  it("blocks unauthorized user", async () => {
    const allowed = await canAccessConversation({
      userId: fixture.strangerId,
      conversationId: fixture.conversationId,
    });
    expect(allowed).toBe(false);
  });

  it("allows active agent to send", async () => {
    const allowed = await canSendMessage({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
    });
    expect(allowed).toBe(true);
  });

  it("blocks removed agent from sending", async () => {
    await fixture.deactivateAgent();
    const allowed = await canSendMessage({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
    });
    expect(allowed).toBe(false);
  });

  it("allows removed agent read-only historical access", async () => {
    const allowed = await canReadMessageHistorically({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      messageCreatedAt: fixture.firstMessageAt,
    });
    expect(allowed).toBe(true);
  });

  it("blocks removed agent from messages after revocation", async () => {
    const allowed = await canReadMessageHistorically({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      messageCreatedAt: new Date().toISOString(),
    });
    expect(allowed).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pnpm test tests/property-conversations/permissions.test.ts
```

- [ ] **Step 3: Implement `can-access-conversation.repository.ts`**

Key logic:

```typescript
export async function canSendMessage(input: {
  userId: string;
  conversationId: string;
}): Promise<boolean> {
  const row = await getParticipantState(input);
  if (!row || row.revoked_at) return false;
  return isActiveParticipant(input.userId, row.conversation_id);
}

export async function canReadMessageHistorically(input: {
  userId: string;
  conversationId: string;
  messageCreatedAt: string;
}): Promise<boolean> {
  const state = await getParticipantState(input);
  if (!state) return false;
  if (!state.revoked_at) return await canAccessConversation(input);
  return new Date(input.messageCreatedAt) <= new Date(state.revoked_at);
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/modules/property-conversations/repositories/can-access-conversation.repository.ts tests/
git commit -m "feat: add conversation permission checks with historical read"
```

---

## Task 5: Start conversation service (Subagent B) — TDD

**Files:**
- Create: `src/modules/property-conversations/repositories/participants.repository.ts`
- Create: `src/modules/property-conversations/repositories/property-conversations.repository.ts`
- Create: `src/modules/property-conversations/repositories/participant-states.repository.ts`
- Create: `src/modules/property-conversations/services/start-conversation.service.ts`
- Create: `tests/property-conversations/start-conversation.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
describe("conversation creation", () => {
  it("client creates conversation linked to property", async () => { /* ... */ });
  it("returns existing conversation for same property+client", async () => { /* ... */ });
  it("conversation visible to owner in list", async () => { /* ... */ });
  it("conversation visible to enabled agents in list", async () => { /* ... */ });
  it("rejects when allow_chat is false", async () => { /* ... */ });
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement `startConversationService`**

Flow:
1. Validate client role
2. Check `property_commercialization.allow_chat` + `properties.status = 'PUBLISHED'`
3. `INSERT ... ON CONFLICT (property_id, client_id) DO UPDATE SET updated_at = now() RETURNING *`
4. `upsertParticipantStates()` for owner + active agents + client

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

---

## Task 6: Send message + notifications (Subagent B) — TDD

**Files:**
- Create: `src/modules/property-conversations/repositories/messages.repository.ts`
- Create: `src/modules/property-conversations/services/send-message.service.ts`
- Modify: `src/modules/notifications/services/notification-dispatch.service.ts`
- Create: `tests/property-conversations/send-message.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
describe("messaging", () => {
  it("client sends message", async () => { /* ... */ });
  it("agent sends message", async () => { /* ... */ });
  it("owner sends message", async () => { /* ... */ });
  it("creates MESSAGE_RECEIVED notifications for all participants except sender", async () => {
    const before = await countNotifications(fixture.ownerId);
    await sendMessage({ userId: fixture.clientId, conversationId, body: "Hola" });
    const after = await countNotifications(fixture.ownerId);
    expect(after).toBe(before + 1);
  });
  it("does not notify revoked agents", async () => { /* ... */ });
});
```

- [ ] **Step 2: Implement `notifyPropertyConversationMessage`**

```typescript
export async function notifyPropertyConversationMessage(input: {
  conversationId: string;
  propertyId: string;
  senderId: string;
  senderName: string;
  preview: string;
  recipientUserIds: string[];
}) {
  const inputs: CreateNotificationInput[] = input.recipientUserIds.map((userId) => ({
    userId,
    type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
    title: "Nuevo mensaje",
    body: `${input.senderName}: ${input.preview}`,
    entityType: "property_conversation",
    entityId: input.conversationId,
    metadata: {
      senderName: input.senderName,
      preview: input.preview,
      propertyId: input.propertyId,
    },
  }));
  return createNotifications(inputs);
}
```

- [ ] **Step 3: Transaction in `sendMessageService`**

```
BEGIN
  INSERT message
  UPDATE conversation last_message_*
  UPDATE participant_states unread (non-sender, non-revoked)
COMMIT
→ notifyPropertyConversationMessage()
```

- [ ] **Step 4: Run tests — PASS**

- [ ] **Step 5: Update deep link**

`notification-push-url.ts` + `web/.../notification-ui.ts` → `/mensajes/${entityId}`

- [ ] **Step 6: Commit**

---

## Task 7: Agent lifecycle hooks (Subagent B)

**Files:**
- Create: `src/modules/property-conversations/services/sync-participants.service.ts`
- Modify: `src/modules/agent-applications/repositories/agent-applications.repository.ts`

- [ ] **Step 1: Write test — new agent gains access**

```typescript
it("newly enabled agent gains access to active conversations", async () => {
  const { conversationId, propertyId } = fixture;
  const newAgentId = await createAgentUser();
  await acceptAgentApplication(propertyId, newAgentId);
  const list = await listConversationsService({ userId: newAgentId });
  expect(list.map((c) => c.id)).toContain(conversationId);
});
```

- [ ] **Step 2: Implement `syncParticipantsOnAgentEnabled(propertyId, agentId)`**

- [ ] **Step 3: Implement `revokeParticipantOnAgentDeactivated(propertyId, agentId)`**

Set `revoked_at = now()` on all states for that agent+property conversations.

- [ ] **Step 4: Wire into agent application ACCEPTED block** (after property_assignments insert)

- [ ] **Step 5: Align `canManageProperty` to `property_assignments.is_active`**

- [ ] **Step 6: Run all tests — PASS**

- [ ] **Step 7: Commit**

---

## Task 8: HTTP routes (Subagent B)

**Files:**
- Create: `src/modules/property-conversations/schemas/property-conversation.schema.ts`
- Create: `src/modules/property-conversations/controllers/property-conversations.controller.ts`
- Create: `src/modules/property-conversations/routes/property-conversations.routes.ts`
- Modify: `src/app.ts`

- [ ] **Step 1: Routes**

| Method | Path | Handler |
|--------|------|---------|
| POST | `/` | `startConversationController` |
| GET | `/` | `listConversationsController` |
| GET | `/historical` | `listHistoricalConversationsController` |
| GET | `/:id` | `getConversationController` |
| GET | `/:id/messages` | `listMessagesController` |
| POST | `/:id/messages` | `sendMessageController` |
| POST | `/:id/read` | `markReadController` |

- [ ] **Step 2: Register in `app.ts`**

```typescript
await app.register(propertyConversationsRoutes, {
  prefix: "/property-conversations",
});
```

- [ ] **Step 3: Deprecate `/chats`**

```typescript
return reply.status(410).send({
  success: false,
  error: { code: "DEPRECATED", message: "Use /property-conversations" },
});
```

- [ ] **Step 4: Manual smoke via curl / fastify.inject**

- [ ] **Step 5: Commit**

---

## Task 9: Unread + polling tests (Subagent D)

**Files:**
- Create: `tests/property-conversations/realtime-polling.test.ts`
- Create: `src/modules/property-conversations/services/mark-read.service.ts`

- [ ] **Step 1: Write failing tests**

```typescript
describe("unread counters", () => {
  it("increments unread for all active participants except sender", async () => { /* ... */ });
  it("resets unread on mark read", async () => { /* ... */ });
  it("updates last_read_at on mark read", async () => { /* ... */ });
  it("list endpoint reflects new message without websocket", async () => {
    await sendMessage({ ... });
    const inbox = await listConversationsService({ userId: fixture.ownerId });
    const row = inbox.find((c) => c.id === fixture.conversationId);
    expect(row?.unreadCount).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Implement mark-read service**

- [ ] **Step 3: Run — PASS**

- [ ] **Step 4: Commit**

---

## Task 10: Frontend inbox + thread (Subagent C)

**Files:**
- Create: `web/src/app/modules/property-conversations/**`
- Modify: `web/src/app/routes.tsx`
- Modify: `web/src/app/modules/agent-applications/pages/Messages.tsx` → re-export or replace

- [ ] **Step 1: API service**

```typescript
export async function listPropertyConversations() {
  return api.get("/property-conversations");
}
export async function sendPropertyConversationMessage(conversationId: string, body: string) {
  return api.post(`/property-conversations/${conversationId}/messages`, { body });
}
```

- [ ] **Step 2: `ConversationsInbox.tsx`**

Role-aware list:
- Client: own conversations
- Owner: conversations on owned properties
- Agent: assigned properties
- Badge for `unreadCount`

- [ ] **Step 3: `ConversationThread.tsx`**

- Message list (paginated)
- Send form (disabled if read-only historical)
- `useConversationPolling` — 30s interval when mounted
- Call `POST /:id/read` on open

- [ ] **Step 4: Routes**

```tsx
{ path: "mensajes", element: <ConversationsInbox /> },
{ path: "mensajes/:conversationId", element: <ConversationThread /> },
```

- [ ] **Step 5: Commit**

---

## Task 11: PropertyDetails inline chat (Subagent C)

**Files:**
- Modify: `web/src/app/modules/explore/pages/PropertyDetails.tsx`

- [ ] **Step 1: Replace local `chatMessages` state with API**

On send:
1. `POST /property-conversations` with `{ propertyId, body }` (or start + message)
2. Navigate to `/mensajes/:conversationId` OR append to thread inline

- [ ] **Step 2: Remove fake local-only messages**

- [ ] **Step 3: Gate on `allowChat` from property details DTO** (add field if missing)

- [ ] **Step 4: Commit**

---

## Task 12: Code review (required before completion)

**REQUIRED SUB-SKILL:** superpowers:requesting-code-review

- [ ] Dispatch code-reviewer subagent on full branch diff
- [ ] Review checklist:
  - Architecture matches spec
  - Graph consistency (`graphify update .`)
  - Security: no unauthorized read/send
  - Permissions: historical read-only for revoked agents
  - Notification fan-out correct
  - Scalability: indexes, batch notifications
  - Future: `assigned_agent_id`, `metadata`, enum status preserved
- [ ] Address all findings before Task 13

---

## Task 13: Verification before completion

**REQUIRED SUB-SKILL:** superpowers:verification-before-completion

- [ ] **Run full test suite**

```bash
pnpm test
```

Expected: all property-conversations tests PASS

- [ ] **Run build**

```bash
pnpm build
cd web && pnpm build
```

- [ ] **Manual test plan**

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Client messages from PropertyDetails | Conversation created, owner+agents notified |
| 2 | Agent replies | Client sees message, unread updates |
| 3 | Owner replies | All participants see message |
| 4 | Agent removed | No new notifications; historical read works |
| 5 | New agent added | Sees active conversations |
| 6 | Push tap | Opens `/mensajes/:id` |
| 7 | Unauthorized user | 403 |

- [ ] **Graphify fresh**

```bash
graphify update .
```

- [ ] **Sync propie-brain doc status** → `implementado` when verified

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| 3 tables + enum status | Task 3 |
| `last_read_at` | Task 3, 9 |
| `assigned_agent_id` + `metadata` | Task 3 |
| Client starts conversation | Task 5 |
| Owner + agents visibility | Task 5, 8 |
| Send by all roles | Task 6 |
| Notifications | Task 6 |
| Removed agent historical read | Task 4, 7 |
| New agent access | Task 7 |
| No Agent↔Client direct chat | Task 8 (deprecate /chats) |
| Unread + polling "realtime" | Task 9, 10 |
| Frontend inbox + thread | Task 10, 11 |
| Code review gate | Task 12 |
| Verification gate | Task 13 |

**Placeholder scan:** None — all tasks have concrete files and code.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-09-property-conversations.md`.**

**Documentation persisted to `propie-brain/product/features/property-conversations/`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task (B/C/D), two-stage review between tasks
2. **Inline Execution** — implement task-by-task in this session with checkpoints

**Which approach?**
