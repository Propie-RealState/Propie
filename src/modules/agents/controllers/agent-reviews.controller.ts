import type { FastifyReply, FastifyRequest } from "fastify";

import { applyPublicReadCache } from "@/lib/http/cache-headers";
import {
  checkCanReviewService,
  createUserReviewService,
  listUserReviewsService,
} from "../services/agent-reviews.service";
import { CreateReviewSchema } from "../schemas/agent-review.schema";

export async function checkCanReviewController(
  request: FastifyRequest<{
    Params: {
      userId: string;
    };
    Querystring: {
      propertyId?: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { userId } = request.params;
  const { propertyId } = request.query;

  const data = await checkCanReviewService({
    targetUserId: userId,
    reviewerUserId: request.user.id,
    propertyId,
  });

  return reply.send({ success: true, data });
}

export async function listUserReviewsController(
  request: FastifyRequest<{
    Params: {
      userId: string;
    };
    Querystring: {
      limit?: string;
      offset?: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { userId } = request.params;
  const query = request.query;

  const reviews = await listUserReviewsService({
    targetUserId: userId,
    limit: query.limit ? parseInt(query.limit, 10) : 10,
    offset: query.offset ? parseInt(query.offset, 10) : 0,
  });

  applyPublicReadCache(reply);
  return reply.send({ success: true, data: reviews });
}

export async function createUserReviewController(
  request: FastifyRequest<{
    Params: {
      userId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { userId: targetUserId } = request.params;

  let body;

  try {
    body = CreateReviewSchema.parse(request.body);
  } catch {
    return reply.status(400).send({
      success: false,
      error: { code: "INVALID_BODY", message: "Invalid request body" },
    });
  }

  const result = await createUserReviewService({
    targetUserId,
    reviewerUserId: request.user.id,
    body,
  });

  if (!result.ok) {
    return reply.status(result.status).send({
      success: false,
      error: { code: result.code, message: result.message },
    });
  }

  return reply.status(201).send({ success: true, data: result.review });
}

export async function listLegacyAgentReviewsController(
  request: FastifyRequest<{
    Params: {
      agentId: string;
    };
    Querystring: {
      limit?: string;
      offset?: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { agentId } = request.params;
  const query = request.query;

  const reviews = await listUserReviewsService({
    targetUserId: agentId,
    limit: query.limit ? parseInt(query.limit, 10) : 10,
    offset: query.offset ? parseInt(query.offset, 10) : 0,
  });

  applyPublicReadCache(reply);
  return reply.send({ success: true, data: reviews });
}
