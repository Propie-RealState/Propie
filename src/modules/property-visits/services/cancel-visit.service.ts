import { db } from "@/database/client";

import {
  notifyVisitCancelled,
} from "@/modules/notifications/services/notification-dispatch.service";

import {
  canCancelVisitAsClient,
  canManageVisit,
  getVisitAccessRole,
} from "../repositories/can-access-visit.repository";
import { insertVisitEventRepository } from "../repositories/visit-events.repository";
import { deleteVisitRemindersRepository } from "../repositories/visit-reminders.repository";
import {
  findVisitByIdRepository,
  updateVisitRepository,
} from "../repositories/visits.repository";
import { mapVisitRow } from "../utils/map-visit";
import { postVisitSystemMessageService } from "./post-visit-system-message.service";

const CANCELLABLE_STATUSES = new Set([
  "SCHEDULED",
  "CONFIRMED",
  "RESCHEDULED",
]);

export async function cancelVisitService(input: {
  userId: string;
  visitId: string;
  reason?: string;
}) {
  const accessRole = await getVisitAccessRole({
    userId: input.userId,
    visitId: input.visitId,
  });

  if (!accessRole) {
    throw new Error("FORBIDDEN");
  }

  const canCancel =
    (accessRole === "CLIENT"
      && await canCancelVisitAsClient(input))
    || ((accessRole === "AGENT" || accessRole === "OWNER")
      && await canManageVisit(input));

  if (!canCancel) {
    throw new Error("FORBIDDEN");
  }

  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    throw new Error("VISIT_NOT_FOUND");
  }

  if (!CANCELLABLE_STATUSES.has(visit.status)) {
    throw new Error("VISIT_NOT_ACTIVE");
  }

  const reason = input.reason?.trim() || null;
  const now = new Date().toISOString();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const updated = await updateVisitRepository(
      {
        visitId: visit.id,
        status: "CANCELLED",
        cancelledReason: reason,
        cancelledAt: now,
      },
      client,
    );

    if (!updated) {
      throw new Error("VISIT_NOT_FOUND");
    }

    await insertVisitEventRepository(
      {
        visitId: visit.id,
        actorId: input.userId,
        actorRole: accessRole,
        eventType: "CANCELLED",
        payload: { reason },
      },
      client,
    );

    await deleteVisitRemindersRepository(visit.id, client);

    await client.query("COMMIT");

    await postVisitSystemMessageService({
      visit: updated,
      actorId: input.userId,
      actorRole: accessRole,
      event: "cancelled",
      reason,
    });

    await notifyVisitCancelled({
      visitId: updated.id,
      propertyId: updated.property_id,
      clientId: updated.client_id,
      agentId: updated.agent_id,
      conversationId: updated.conversation_id,
      scheduledAt: updated.scheduled_at,
      reason,
      cancelledByRole: accessRole,
      excludeUserId: input.userId,
    });

    return mapVisitRow(updated);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
