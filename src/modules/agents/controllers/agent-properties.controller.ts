import type { FastifyReply, FastifyRequest } from "fastify";

import { applyPublicReadCache } from "@/lib/http/cache-headers";
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

  applyPublicReadCache(reply);
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

  applyPublicReadCache(reply);
  return reply.send({ success: true, data: properties });
}
