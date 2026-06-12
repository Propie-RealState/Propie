import type {
  PropertyVisitEventRow,
  PropertyVisitReminderRow,
  PropertyVisitRow,
} from "@/database/types/property-visits";

import type {
  Visit,
  VisitEvent,
  VisitReminder,
} from "../types/visit.types";

export function mapVisitRow(row: PropertyVisitRow): Visit {
  return {
    id: row.id,
    propertyId: row.property_id,
    conversationId: row.conversation_id,
    clientId: row.client_id,
    agentId: row.agent_id,
    createdBy: row.created_by,
    status: row.status,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    notes: row.notes,
    cancelledReason: row.cancelled_reason,
    metadata: row.metadata,
    confirmedAt: row.confirmed_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapVisitEventRow(row: PropertyVisitEventRow): VisitEvent {
  return {
    id: row.id,
    visitId: row.visit_id,
    actorId: row.actor_id,
    actorRole: row.actor_role,
    eventType: row.event_type,
    payload: row.payload,
    createdAt: row.created_at,
  };
}

export function mapVisitReminderRow(
  row: PropertyVisitReminderRow,
): VisitReminder {
  return {
    id: row.id,
    visitId: row.visit_id,
    offsetMinutes: row.offset_minutes,
    remindAt: row.remind_at,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}
