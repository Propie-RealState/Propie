import {
  countPendingOwnerAgentApplicationsRepository,
  createAgentApplicationRepository,
  findOwnerAgentApplicationByIdRepository,
  getAgentApplicationByPropertyRepository,
  getOwnerAgentApplicationsRepository,
  revokeOwnerAgentApplicationRepository,
  updateOwnerAgentApplicationStatusRepository,
} from "../repositories/agent-applications.repository";
import {
  notifyAgentApplicationStatus,
  notifyOwnerAgentApplicationReceived,
} from "@/modules/notifications/services/notification-dispatch.service";
import { assertPropertyAcceptsAgents } from "@/modules/properties/services/assert-property-accepts-agents.service";
import { db } from "@/database/client";

export async function createAgentApplication(input: {
  propertyId: string;
  agentId: string;
  message?: string | null;
}) {
  await assertPropertyAcceptsAgents(input.propertyId);

  const application = await createAgentApplicationRepository({
    propertyId: input.propertyId,
    agentId: input.agentId,
    message: input.message?.trim() || null,
  });

  try {
    const context = await db.query(
      `
        SELECT
          p.owner_id,
          p.title AS property_title,
          TRIM(CONCAT(pr.first_name, ' ', COALESCE(pr.last_name, ''))) AS agent_name,
          u.email AS agent_email
        FROM properties p
        INNER JOIN users u
          ON u.id = $2
        LEFT JOIN profiles pr
          ON pr.user_id = u.id
        WHERE p.id = $1
        LIMIT 1
      `,
      [input.propertyId, input.agentId],
    );

    const row = context.rows[0];

    if (row?.owner_id) {
      await notifyOwnerAgentApplicationReceived({
        ownerId: row.owner_id,
        propertyId: input.propertyId,
        applicationId: application.id,
        agentName:
          row.agent_name?.trim() || row.agent_email || "Un agente",
        propertyTitle: row.property_title,
      });
    }
  } catch (error) {
    console.error("Failed to dispatch agent application notification", error);
  }

  return application;
}

export async function getOwnerAgentApplications(ownerId: string) {
  return getOwnerAgentApplicationsRepository(ownerId);
}

export async function getAgentApplicationByProperty(input: {
  propertyId: string;
  agentId: string;
}) {
  return getAgentApplicationByPropertyRepository(input);
}

export async function countPendingOwnerAgentApplications(ownerId: string) {
  return countPendingOwnerAgentApplicationsRepository(ownerId);
}

export async function findOwnerAgentApplicationById(input: {
  applicationId: string;
  ownerId: string;
}) {
  return findOwnerAgentApplicationByIdRepository(input);
}

export async function revokeOwnerAgentApplication(input: {
  applicationId: string;
  ownerId: string;
}) {
  return revokeOwnerAgentApplicationRepository(input);
}

export async function updateOwnerAgentApplicationStatus(input: {
  applicationId: string;
  ownerId: string;
  status: "ACCEPTED" | "REJECTED";
}) {
  if (input.status === "ACCEPTED") {
    const existing = await findOwnerAgentApplicationByIdRepository(input);

    if (existing) {
      await assertPropertyAcceptsAgents(existing.property_id);
    }
  }

  const application = await updateOwnerAgentApplicationStatusRepository(input);

  if (application) {
    try {
      const context = await db.query(
        `
          SELECT p.title AS property_title
          FROM properties p
          WHERE p.id = $1
          LIMIT 1
        `,
        [application.property_id],
      );

      await notifyAgentApplicationStatus({
        agentId: application.agent_id,
        applicationId: application.id,
        propertyId: application.property_id,
        propertyTitle: context.rows[0]?.property_title ?? null,
        status: input.status,
      });
    } catch (error) {
      console.error(
        "Failed to dispatch agent application status notification",
        error,
      );
    }
  }

  return application;
}
