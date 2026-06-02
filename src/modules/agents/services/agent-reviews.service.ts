import {
  canUserReviewAgentRepository,
  createAgentReviewRepository,
  getAgentReviewsRepository,
  type CreateAgentReviewInput,
} from "../repositories/agent-reviews.repository";

export async function createAgentReviewService(
  input: CreateAgentReviewInput,
) {
  const canReview = await canUserReviewAgentRepository({
    reviewerUserId: input.reviewerUserId,
    agentId: input.agentId,
    propertyId: input.propertyId,
  });

  if (!canReview) {
    throw new Error("NO_PERMISSION");
  }

  return createAgentReviewRepository(input);
}

export async function getAgentReviewsService(input: {
  agentId: string;
  limit?: number;
  offset?: number;
}) {
  return getAgentReviewsRepository({
    agentId: input.agentId,
    limit: input.limit ?? 10,
    offset: input.offset ?? 0,
  });
}
