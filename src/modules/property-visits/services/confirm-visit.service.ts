import { db } from "@/database/client";

import {
  notifyVisitConfirmed,
} from "@/modules/notifications/services/notification-dispatch.service";

import {
  canConfirmVisitAsClient,
  canManageVisit,
  getVisitAccessRole,
} from "../repositories/can-access-visit.repository";
import { insertVisitEventRepository } from "../repositories/visit-events.repository";
import {
  findVisitByIdRepository,
  updateVisitRepository,
} from "../repositories/visits.repository";
import { mapVisitRow } from "../utils/map-visit";
import { postVisitSystemMessageService } from "./post-visit-system-message.service";

const ACTIVE_STATUSES = new Set(["SCHEDULED", "CONFIRMED", "RESCHEDULED"]);

export async function confirmVisitService(input: {
  userId: string;
  visitId: string;
}) {
  const accessRole = await getVisitAccessRole({
    userId: input.userId,
    visitId: input.visitId,
  });

  if (!accessRole) {
    throw new Error("FORBIDDEN");
  }

  const canConfirm =
    (accessRole === "CLIENT"
      && await canConfirmVisitAsClient(input))
    || ((accessRole === "AGENT" || accessRole === "OWNER")
      && await canManageVisit(input));

  if (!canConfirm) {
    throw new Error("FORBIDDEN");
  }

  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    throw new Error("VISIT_NOT_FOUND");
  }

  if (!ACTIVE_STATUSES.has(visit.status)) {
    throw new Error("VISIT_NOT_ACTIVE");
  }

  const now = new Date().toISOString();
  const metadata = {
    ...visit.metadata,
    ...(accessRole === "CLIENT"
      ? { clientConfirmedAt: now }
      : accessRole === "OWNER"
        ? { ownerConfirmedAt: now }
        : { agentConfirmedAt: now }),
  };

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const updated = await updateVisitRepository(
      {
        visitId: visit.id,
        status: "CONFIRMED",
        metadata,
        confirmedAt: visit.confirmed_at ?? now,
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
        eventType: "CONFIRMED",
        payload: { confirmedAt: now },
      },
      client,
    );

    await client.query("COMMIT");

    await postVisitSystemMessageService({
      visit: updated,
      actorId: input.userId,
      actorRole: accessRole,
      event: "confirmed",
    });

    await notifyVisitConfirmed({
      visitId: updated.id,
      propertyId: updated.property_id,
      clientId: updated.client_id,
      agentId: updated.agent_id,
      conversationId: updated.conversation_id,
      scheduledAt: updated.scheduled_at,
      confirmedByRole: accessRole,
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
