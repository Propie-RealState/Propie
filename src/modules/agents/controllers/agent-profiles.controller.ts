import type { FastifyReply, FastifyRequest } from "fastify";

import {
  getAgentPublicProfileService,
  getUserPublicProfileService,
} from "../services/get-user-public-profile.service";

export async function getUserPublicProfileController(
  request: FastifyRequest<{
    Params: {
      userId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { userId } = request.params;

  const profile = await getUserPublicProfileService(userId);

  if (!profile) {
    return reply.status(404).send({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "User not found" },
    });
  }

  return reply.send({
    success: true,
    data: profile,
  });
}

export async function getAgentPublicProfileController(
  request: FastifyRequest<{
    Params: {
      agentId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { agentId } = request.params;

  const profile = await getAgentPublicProfileService(agentId);

  if (!profile) {
    return reply.status(404).send({
      success: false,
      error: { code: "AGENT_NOT_FOUND", message: "Agent not found" },
    });
  }

  return reply.send({ success: true, data: profile });
}
