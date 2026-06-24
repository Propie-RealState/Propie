import { findUserById } from "@/database/repositories/user.repository";
import { isAdmin } from "@/utils/authorization";

import { canViewVisit } from "../repositories/can-access-visit.repository";
import { findVisitByIdRepository } from "../repositories/visits.repository";
import { mapVisitRow } from "../utils/map-visit";

export async function getVisitService(input: {
  userId: string;
  visitId: string;
}) {
  const user = await findUserById(input.userId);
  const allowed = user && isAdmin(user.role)
    ? true
    : await canViewVisit({
        userId: input.userId,
        visitId: input.visitId,
      });

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    throw new Error("VISIT_NOT_FOUND");
  }

  return mapVisitRow(visit);
}
