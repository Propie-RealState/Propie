import type { FastifyReply, FastifyRequest } from "fastify";

import {
  getCommercializedPropertiesService,
  getPublishedPropertiesService,
} from "../services/agent-properties.service";

export async function getCommercializedPropertiesController(
  request: FastifyRequest<{
    Params: {
      agentId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { agentId } = request.params;

  const properties = await getCommercializedPropertiesService(agentId);

  return reply.send({ success: true, data: properties });
}

export async function getPublishedPropertiesController(
  request: FastifyRequest<{
    Params: {
      userId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { userId } = request.params;

  const properties = await getPublishedPropertiesService(userId);

  return reply.send({ success: true, data: properties });
}
