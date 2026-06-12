import {
  canReviewRepository,
  getReviewablePropertiesRepository,
} from "../repositories/can-review.repository";
import { getUserRolesByIdsRepository } from "../repositories/get-user-roles.repository";
import {
  createUserReviewRepository,
  getUserReviewsRepository,
} from "../repositories/user-reviews.repository";
import type { CreateReviewInput } from "../schemas/agent-review.schema";

const REVIEW_FORBIDDEN_MESSAGES: Record<string, string> = {
  SELF_REVIEW: "No podés calificarte a vos mismo",
  NO_ASSIGNMENT: "Solo podés calificar a personas con las que trabajaste",
  ALREADY_REVIEWED: "Ya calificaste a esta persona para esta propiedad",
};

export async function checkCanReviewService(input: {
  targetUserId: string;
  reviewerUserId: string;
  propertyId?: string;
}) {
  const { targetUserId, reviewerUserId, propertyId } = input;

  if (reviewerUserId === targetUserId) {
    return {
      canReview: false,
      reason: "SELF_REVIEW" as const,
      reviewableProperties: [] as { property_id: string; property_title: string }[],
    };
  }

  if (propertyId) {
    const result = await canReviewRepository({
      propertyId,
      reviewerUserId,
      targetUserId,
    });

    return { ...result, reviewableProperties: [] };
  }

  const reviewableProperties = await getReviewablePropertiesRepository({
    reviewerUserId,
    targetUserId,
  });

  return {
    canReview: reviewableProperties.length > 0,
    reason: reviewableProperties.length > 0 ? ("OK" as const) : ("NO_ASSIGNMENT" as const),
    reviewableProperties,
  };
}

export async function listUserReviewsService(input: {
  targetUserId: string;
  limit: number;
  offset: number;
}) {
  return getUserReviewsRepository(input);
}

export async function createUserReviewService(input: {
  targetUserId: string;
  reviewerUserId: string;
  body: CreateReviewInput;
}) {
  const { targetUserId, reviewerUserId, body } = input;

  const { canReview, reason } = await canReviewRepository({
    propertyId: body.propertyId,
    reviewerUserId,
    targetUserId,
  });

  if (!canReview) {
    return {
      ok: false as const,
      status: 403 as const,
      code: reason,
      message: REVIEW_FORBIDDEN_MESSAGES[reason] ?? "No permitido",
    };
  }

  const roleRows = await getUserRolesByIdsRepository([
    reviewerUserId,
    targetUserId,
  ]);

  const reviewerRow = roleRows.find((row) => row.id === reviewerUserId);
  const targetRow = roleRows.find((row) => row.id === targetUserId);

  if (!reviewerRow || !targetRow) {
    return {
      ok: false as const,
      status: 404 as const,
      code: "USER_NOT_FOUND",
      message: "User not found",
    };
  }

  const review = await createUserReviewRepository({
    targetUserId,
    reviewerUserId,
    propertyId: body.propertyId,
    reviewerRole: reviewerRow.role as "OWNER" | "AGENT" | "CLIENT",
    targetRole: targetRow.role as "OWNER" | "AGENT" | "CLIENT",
    rating: body.rating,
    comment: body.comment ?? null,
  });

  return { ok: true as const, review };
}
