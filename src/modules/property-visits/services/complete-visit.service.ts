import { db } from "@/database/client";

import {
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

const COMPLETABLE_STATUSES = new Set([
  "SCHEDULED",
  "CONFIRMED",
  "RESCHEDULED",
]);

export async function completeVisitService(input: {
  userId: string;
  visitId: string;
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

  if (!COMPLETABLE_STATUSES.has(visit.status)) {
    throw new Error("VISIT_NOT_ACTIVE");
  }

  const now = new Date().toISOString();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const updated = await updateVisitRepository(
      {
        visitId: visit.id,
        status: "COMPLETED",
        completedAt: now,
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
        eventType: "COMPLETED",
        payload: { completedAt: now },
      },
      client,
    );

    await deleteVisitRemindersRepository(visit.id, client);

    await client.query("COMMIT");

    await postVisitSystemMessageService({
      visit: updated,
      actorId: input.userId,
      actorRole: accessRole,
      event: "completed",
    });

    return mapVisitRow(updated);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
