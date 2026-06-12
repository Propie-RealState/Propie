import { db } from "@/database/client";

import { isActiveAgentOnProperty } from "@/modules/property-conversations/repositories/participants.repository";

import { findVisitByIdRepository } from "./visits.repository";

export async function canViewVisit(input: {
  userId: string;
  visitId: string;
}): Promise<boolean> {
  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    return false;
  }

  if (visit.client_id === input.userId) {
    return true;
  }

  if (visit.agent_id === input.userId) {
    return true;
  }

  const ownerResult = await db.query<{ owner_id: string }>(
    `
      SELECT owner_id
      FROM properties
      WHERE id = $1
      LIMIT 1
    `,
    [visit.property_id],
  );

  return ownerResult.rows[0]?.owner_id === input.userId;
}

async function isPropertyOwner(
  userId: string,
  propertyId: string,
): Promise<boolean> {
  const ownerResult = await db.query<{ owner_id: string }>(
    `
      SELECT owner_id
      FROM properties
      WHERE id = $1
      LIMIT 1
    `,
    [propertyId],
  );

  return ownerResult.rows[0]?.owner_id === userId;
}

export async function canManageVisitAsAgent(input: {
  userId: string;
  visitId: string;
}): Promise<boolean> {
  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    return false;
  }

  if (visit.agent_id !== input.userId) {
    const isActive = await isActiveAgentOnProperty(
      input.userId,
      visit.property_id,
    );

    if (!isActive) {
      return false;
    }
  }

  return isActiveAgentOnProperty(input.userId, visit.property_id);
}

export async function canManageVisitAsOwner(input: {
  userId: string;
  visitId: string;
}): Promise<boolean> {
  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    return false;
  }

  return isPropertyOwner(input.userId, visit.property_id);
}

export async function canManageVisit(input: {
  userId: string;
  visitId: string;
}): Promise<boolean> {
  return (
    await canManageVisitAsAgent(input)
    || await canManageVisitAsOwner(input)
  );
}

export async function canConfirmVisitAsClient(input: {
  userId: string;
  visitId: string;
}): Promise<boolean> {
  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    return false;
  }

  return visit.client_id === input.userId;
}

export async function canCancelVisitAsClient(input: {
  userId: string;
  visitId: string;
}): Promise<boolean> {
  return canConfirmVisitAsClient(input);
}

export async function getVisitAccessRole(input: {
  userId: string;
  visitId: string;
}): Promise<"CLIENT" | "OWNER" | "AGENT" | null> {
  const visit = await findVisitByIdRepository(input.visitId);

  if (!visit) {
    return null;
  }

  if (visit.client_id === input.userId) {
    return "CLIENT";
  }

  if (await isPropertyOwner(input.userId, visit.property_id)) {
    return "OWNER";
  }

  if (
    visit.agent_id === input.userId
    || await isActiveAgentOnProperty(input.userId, visit.property_id)
  ) {
    return "AGENT";
  }

  return null;
}
