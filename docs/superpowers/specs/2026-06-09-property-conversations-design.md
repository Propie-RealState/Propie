# Property Conversations — Design Spec

**Status:** Approved 2026-06-09  
**Source of truth (product):** `propie-brain/product/features/property-conversations/property-conversations.md`

## Approved decisions

- Entity model: `property_conversations`, `property_conversation_messages`, `property_conversation_participant_states`
- Permission matrix: approved
- Approach A: new `property-conversations` module
- Historical access: read-only for removed agents (no new messages/notifications)
- `last_read_at` on participant states
- Status enum: `OPEN`, `ARCHIVED`, `CLOSED`
- Preserve `assigned_agent_id` and `metadata JSONB`

## Unification (approved 2026-06-11)

- `conversation_type`: `PROPERTY_CLIENT` | `PROPERTY_INTERNAL`
- `internal_agent_id`: agent participant in owner↔agent threads (≠ `assigned_agent_id`)
- `assigned_agent_id` remains reserved for CRM / lead ownership / Propie Brain
- Single inbox at `/mensajes`; owner-agent modal removed
- Plan: `docs/superpowers/plans/2026-06-11-property-conversations-unification.md`

## Implementation plan

See `docs/superpowers/plans/2026-06-09-property-conversations.md`
