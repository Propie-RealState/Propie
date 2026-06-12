import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  countPendingOwnerAgentApplications,
  createAgentApplication,
  findOwnerAgentApplicationById,
  getAgentApplicationByProperty,
  getOwnerAgentApplications,
  revokeOwnerAgentApplication,
  updateOwnerAgentApplicationStatus,
} from "../services/agent-applications.service";
import { PropertyAgentParticipationBlockedError } from "@/modules/properties/services/assert-property-accepts-agents.service";
import {
  createAgentApplicationSchema,
  updateAgentApplicationStatusSchema,
} from "../schemas/agent-application.schema";

export async function createAgentApplicationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (request.user.role !== "AGENT") {
    return reply.status(403).send({
      success: false,
      message: "Only agents can send applications",
    });
  }

  const body = createAgentApplicationSchema.parse(request.body);

  try {
    const application = await createAgentApplication({
      propertyId: body.propertyId,
      agentId: request.user.id,
      message: body.message,
    });

    return reply.status(201).send({
      success: true,
      data: application,
    });
  } catch (error) {
    if (error instanceof PropertyAgentParticipationBlockedError) {
      return reply.status(403).send({
        success: false,
        message: error.message,
      });
    }

    throw error;
  }
}

export async function getOwnerAgentApplicationsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const applications = await getOwnerAgentApplications(request.user.id);

  return reply.send({
    success: true,
    data: applications,
  });
}

export async function getMyAgentApplicationByPropertyController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };
  }>,
  reply: FastifyReply,
) {
  if (request.user.role !== "AGENT") {
    return reply.status(403).send({
      success: false,
      message: "Only agents can inspect their applications",
    });
  }

  const application = await getAgentApplicationByProperty({
    propertyId: request.params.propertyId,
    agentId: request.user.id,
  });

  return reply.send({
    success: true,
    data: application,
  });
}

export async function getOwnerAgentApplicationsCountController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const count = await countPendingOwnerAgentApplications(request.user.id);

  return reply.send({
    success: true,
    data: {
      count,
    },
  });
}

export async function updateOwnerAgentApplicationStatusController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  const body = updateAgentApplicationStatusSchema.parse(request.body);

  const existing = await findOwnerAgentApplicationById({
    applicationId: request.params.id,
    ownerId: request.user.id,
  });

  if (!existing) {
    return reply.status(404).send({
      success: false,
      message: "Application not found",
    });
  }

  const isPendingDecision =
    existing.status === "PENDING" &&
    (body.status === "ACCEPTED" || body.status === "REJECTED");
  const isRevokeAcceptedAgent =
    existing.status === "ACCEPTED" && body.status === "REJECTED";

  if (!isPendingDecision && !isRevokeAcceptedAgent) {
    return reply.status(409).send({
      success: false,
      message: "Esta solicitud ya fue procesada",
      data: {
        status: existing.status,
      },
    });
  }

  let application;

  try {
    application = isRevokeAcceptedAgent
      ? await revokeOwnerAgentApplication({
          applicationId: request.params.id,
          ownerId: request.user.id,
        })
      : await updateOwnerAgentApplicationStatus({
          applicationId: request.params.id,
          ownerId: request.user.id,
          status: body.status,
        });
  } catch (error) {
    if (error instanceof PropertyAgentParticipationBlockedError) {
      return reply.status(403).send({
        success: false,
        message: error.message,
      });
    }

    throw error;
  }

  if (!application) {
    return reply.status(404).send({
      success: false,
      message: "Application not found",
    });
  }

  return reply.send({
    success: true,
    data: application,
  });
}
