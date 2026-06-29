import { db } from "@/database/client";

import { canSendMessage } from "@/modules/property-conversations/repositories/can-access-conversation.repository";
import { appendConversationEvent } from "@/modules/property-conversations/services/append-conversation-event.service";
import { getConversationContext } from "@/modules/property-conversations/repositories/participants.repository";

import type { PropertyVisitRow } from "@/database/types/property-visits";

function formatScheduledAt(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

function buildSystemMessageBody(
  event: "created" | "confirmed" | "rescheduled" | "cancelled" | "completed",
  visit: PropertyVisitRow,
  extra?: { reason?: string | null; actorLabel?: string },
) {
  const when = formatScheduledAt(visit.scheduled_at);

  switch (event) {
    case "created":
      return `Visita programada para ${when} (${visit.duration_minutes} min).`;
    case "confirmed":
      return `Visita confirmada para ${when}${extra?.actorLabel ? ` por ${extra.actorLabel}` : ""}.`;
    case "rescheduled":
      return `Visita reprogramada para ${when}.`;
    case "cancelled":
      return extra?.reason
        ? `Visita cancelada: ${extra.reason}`
        : "Visita cancelada.";
    case "completed":
      return `Visita completada (${when}).`;
    default:
      return `Actualización de visita (${when}).`;
  }
}

export async function postVisitSystemMessageService(input: {
  visit: PropertyVisitRow;
  actorId: string;
  actorRole: "CLIENT" | "OWNER" | "AGENT";
  event: "created" | "confirmed" | "rescheduled" | "cancelled" | "completed";
  reason?: string | null;
  actorLabel?: string;
}) {
  if (!input.visit.conversation_id) {
    return null;
  }

  const context = await getConversationContext(input.visit.conversation_id);

  if (!context) {
    return null;
  }

  const canSend = await canSendMessage({
    userId: input.actorId,
    conversationId: input.visit.conversation_id,
  });

  if (!canSend) {
    return null;
  }

  const body = buildSystemMessageBody(input.event, input.visit, {
    reason: input.reason,
    actorLabel: input.actorLabel,
  });

  return appendConversationEvent({
    conversationId: input.visit.conversation_id,
    senderId: input.actorId,
    senderRole: input.actorRole,
    body,
    contentType: "SYSTEM",
    metadata: {
      visitId: input.visit.id,
      event: input.event,
    },
  });
}
