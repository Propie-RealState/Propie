import { apiFetch } from "../../../../lib/api";
import { API_URL } from "../../../../lib/api-base";
import type { PropertyDTO } from "../../explore/types/property.dto";

export type AgentReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  property_id: string | null;
  property_title: string | null;
  reviewer_first_name: string | null;
  reviewer_last_name: string | null;
  reviewer_avatar_url: string | null;
  reviewer_role?: string | null;
};

export type AgentPublicProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  member_since: string | null;
  total_reviews: number;
  average_rating: number;
  total_worked_properties: number;
  active_properties: number;
  completed_properties: number;
};

export type UserPublicProfile = {
  id: string;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  member_since: string | null;
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
  total_worked_properties: number;
  active_properties: number;
  completed_properties: number;
};

export type CanReviewResult = {
  canReview: boolean;
  reason: "OK" | "SELF_REVIEW" | "NO_ASSIGNMENT" | "ALREADY_REVIEWED";
  reviewableProperties: Array<{ property_id: string; property_title: string }>;
};

// ─── Public property lists for profiles ──────────────────────────────────────

export async function getAgentCommercializedProperties(
  agentId: string,
): Promise<PropertyDTO[]> {
  try {
    const response = await fetch(
      `${API_URL}/agents/${agentId}/commercialized-properties`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getOwnerPublishedProperties(
  ownerId: string,
): Promise<PropertyDTO[]> {
  try {
    const response = await fetch(
      `${API_URL}/agents/users/${ownerId}/published-properties`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

// ─── Full agent profile (for /agentes/:agentId page) ─────────────────────────

export async function getAgentPublicProfile(
  agentId: string,
): Promise<AgentPublicProfile | null> {
  try {
    const response = await fetch(`${API_URL}/agents/${agentId}/profile`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

// ─── Generic public profile for any user ─────────────────────────────────────

export async function getUserPublicProfile(
  userId: string,
): Promise<UserPublicProfile | null> {
  try {
    const response = await fetch(`${API_URL}/agents/users/${userId}/public`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

// ─── Reviews for any user (reads from user_reviews table) ────────────────────

export async function getUserReviews(
  userId: string,
  limit = 10,
  offset = 0,
): Promise<AgentReview[]> {
  try {
    const response = await fetch(
      `${API_URL}/agents/users/${userId}/reviews?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

// ─── canReview check ─────────────────────────────────────────────────────────

export async function checkCanReview(
  targetUserId: string,
  propertyId?: string,
): Promise<CanReviewResult> {
  const fallback: CanReviewResult = {
    canReview: false,
    reason: "NO_ASSIGNMENT",
    reviewableProperties: [],
  };

  try {
    const params = propertyId ? `?propertyId=${propertyId}` : "";
    const data = await apiFetch(
      `/agents/users/${targetUserId}/can-review${params}`,
    );
    return data.data ?? fallback;
  } catch {
    return fallback;
  }
}

// ─── Create review for any user ──────────────────────────────────────────────

export async function createUserReview(input: {
  targetUserId: string;
  propertyId: string;
  rating: number;
  comment?: string | null;
}) {
  return apiFetch(`/agents/users/${input.targetUserId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      propertyId: input.propertyId,
      rating: input.rating,
      comment: input.comment ?? null,
    }),
  });
}

// ─── Legacy: create agent review ─────────────────────────────────────────────

export async function createAgentReview(input: {
  agentId: string;
  propertyId: string;
  rating: number;
  comment?: string | null;
}) {
  return createUserReview({
    targetUserId: input.agentId,
    propertyId: input.propertyId,
    rating: input.rating,
    comment: input.comment,
  });
}
