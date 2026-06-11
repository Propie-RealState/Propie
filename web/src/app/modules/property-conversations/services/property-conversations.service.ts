import { apiFetch } from "../../../../lib/api";

import type {
  PropertyConversation,
  PropertyConversationMessage,
} from "../types/property-conversation.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function listPropertyConversations() {
  const response = await apiFetch("/property-conversations") as ApiResponse<
    PropertyConversation[]
  >;

  return response.data;
}

export async function listHistoricalPropertyConversations() {
  const response = await apiFetch(
    "/property-conversations/historical",
  ) as ApiResponse<PropertyConversation[]>;

  return response.data;
}

export async function startPropertyConversation(propertyId: string) {
  const response = await apiFetch("/property-conversations", {
    method: "POST",
    body: JSON.stringify({ propertyId }),
  }) as ApiResponse<PropertyConversation>;

  return response.data;
}

export async function startInternalPropertyConversation(
  propertyId: string,
  agentId?: string,
) {
  const response = await apiFetch("/property-conversations/internal", {
    method: "POST",
    body: JSON.stringify({
      propertyId,
      ...(agentId ? { agentId } : {}),
    }),
  }) as ApiResponse<PropertyConversation>;

  return response.data;
}

export async function getPropertyConversation(conversationId: string) {
  const response = await apiFetch(
    `/property-conversations/${conversationId}`,
  ) as ApiResponse<PropertyConversation>;

  return response.data;
}

export async function listPropertyConversationMessages(
  conversationId: string,
  params?: { limit?: number; offset?: number },
) {
  const search = new URLSearchParams();

  if (params?.limit) {
    search.set("limit", String(params.limit));
  }

  if (params?.offset) {
    search.set("offset", String(params.offset));
  }

  const query = search.toString();
  const path = `/property-conversations/${conversationId}/messages${
    query ? `?${query}` : ""
  }`;

  const response = await apiFetch(path) as ApiResponse<
    PropertyConversationMessage[]
  >;

  return response.data;
}

export async function sendPropertyConversationMessage(
  conversationId: string,
  body: string,
) {
  const response = await apiFetch(
    `/property-conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  ) as ApiResponse<PropertyConversationMessage>;

  return response.data;
}

export async function markPropertyConversationRead(conversationId: string) {
  const response = await apiFetch(
    `/property-conversations/${conversationId}/read`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  ) as ApiResponse<{ conversationId: string }>;

  return response.data;
}
