import { db } from "@/database/client";

import {
  notifyVisitRescheduled,
} from "@/modules/notifications/services/notification-dispatch.service";

import {
  canManageVisit,
  getVisitAccessRole,
} from "../repositories/can-access-visit.repository";
import { insertVisitEventRepository } from "../repositories/visit-events.repository";
import {
  deleteVisitRemindersRepository,
  insertVisitRemindersRepository,
} from "../repositories/visit-reminders.repository";
import {
  findVisitByIdRepository,
  updateVisitRepository,
} from "../repositories/visits.repository";
import {
  VISIT_REMINDER_OFFSETS_MINUTES,
  type VisitStatus,
} from "../types/visit.types";
import { mapVisitRow } from "../utils/map-visit";
import { assertVisitStatusTransition } from "../utils/visit-status-transitions";
import { postVisitSystemMessageService } from "./post-visit-system-message.service";

export async function rescheduleVisitService(input: {
  userId: string;
  visitId: string;
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
}) {
  const accessRole = await getVisitAccessRole({
    userId: input.userId,
    visitId: input.visitId,
  });

  if (
    !accessRole
    || (accessRole !== "AGENT" && accessRole !== "OWNER")
    || !(await canManageVisit(input))
  ) {
    throw new Error("FORBIDDEN");
  }

  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    throw new Error("VISIT_NOT_FOUND");
  }

  assertVisitStatusTransition(visit.status as VisitStatus, "RESCHEDULED");

  const scheduledAtMs = new Date(input.scheduledAt).getTime();

  if (Number.isNaN(scheduledAtMs) || scheduledAtMs <= Date.now()) {
    throw new Error("INVALID_SCHEDULED_AT");
  }

  const previousScheduledAt = visit.scheduled_at;
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const updated = await updateVisitRepository(
      {
        visitId: visit.id,
        status: "RESCHEDULED",
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes ?? visit.duration_minutes,
        notes: input.notes !== undefined
          ? (input.notes.trim() || null)
          : visit.notes,
        confirmedAt: null,
        metadata: {
          ...visit.metadata,
          previousScheduledAt,
        },
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
        eventType: "RESCHEDULED",
        payload: {
          previousScheduledAt,
          scheduledAt: input.scheduledAt,
        },
      },
      client,
    );

    await deleteVisitRemindersRepository(visit.id, client);

    await insertVisitRemindersRepository(
      {
        visitId: visit.id,
        scheduledAt: input.scheduledAt,
        offsetsMinutes: VISIT_REMINDER_OFFSETS_MINUTES,
      },
      client,
    );

    await client.query("COMMIT");

    await postVisitSystemMessageService({
      visit: updated,
      actorId: input.userId,
      actorRole: accessRole,
      event: "rescheduled",
    });

    await notifyVisitRescheduled({
      visitId: updated.id,
      propertyId: updated.property_id,
      clientId: updated.client_id,
      agentId: updated.agent_id,
      conversationId: updated.conversation_id,
      scheduledAt: updated.scheduled_at,
      previousScheduledAt,
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

