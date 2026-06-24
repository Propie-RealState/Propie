import { apiFetch } from "../../../../lib/api";
import { trackEvent } from "../../../../lib/analytics";
import { AnalyticsEvents } from "../../../../lib/analytics-events";

import type {
  CancelVisitInput,
  CreateVisitInput,
  RescheduleVisitInput,
  Visit,
  VisitAnalytics,
  VisitListSegment,
} from "../types/visit.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function listVisits(params?: {
  segment?: VisitListSegment;
  from?: string;
  to?: string;
}) {
  const search = new URLSearchParams();

  if (params?.segment) {
    search.set("segment", params.segment);
  }

  if (params?.from) {
    search.set("from", params.from);
  }

  if (params?.to) {
    search.set("to", params.to);
  }

  const query = search.toString();
  const path = `/property-visits${query ? `?${query}` : ""}`;

  const response = (await apiFetch(path)) as ApiResponse<Visit[]>;
  return response.data;
}

export async function getVisit(visitId: string) {
  const response = (await apiFetch(
    `/property-visits/${visitId}`,
  )) as ApiResponse<Visit>;

  return response.data;
}

export async function createVisit(input: CreateVisitInput) {
  const response = (await apiFetch("/property-visits", {
    method: "POST",
    body: JSON.stringify(input),
  })) as ApiResponse<Visit>;

  trackEvent(AnalyticsEvents.VISIT_CREATED, { conversationId: input.conversationId });

  return response.data;
}

export async function confirmVisit(visitId: string) {
  const response = (await apiFetch(`/property-visits/${visitId}/confirm`, {
    method: "POST",
    body: JSON.stringify({}),
  })) as ApiResponse<Visit>;

  trackEvent(AnalyticsEvents.VISIT_CONFIRMED, { visitId });

  return response.data;
}

export async function rescheduleVisit(
  visitId: string,
  input: RescheduleVisitInput,
) {
  const response = (await apiFetch(`/property-visits/${visitId}/reschedule`, {
    method: "POST",
    body: JSON.stringify(input),
  })) as ApiResponse<Visit>;

  return response.data;
}

export async function cancelVisit(visitId: string, input?: CancelVisitInput) {
  const response = (await apiFetch(`/property-visits/${visitId}/cancel`, {
    method: "POST",
    body: JSON.stringify(input ?? {}),
  })) as ApiResponse<Visit>;

  trackEvent(AnalyticsEvents.VISIT_CANCELLED, { visitId });

  return response.data;
}

export async function completeVisit(visitId: string) {
  const response = (await apiFetch(`/property-visits/${visitId}/complete`, {
    method: "POST",
    body: JSON.stringify({}),
  })) as ApiResponse<Visit>;

  trackEvent(AnalyticsEvents.VISIT_COMPLETED, { visitId });

  return response.data;
}

export async function getVisitAnalytics(params?: { from?: string; to?: string }) {
  const search = new URLSearchParams();

  if (params?.from) {
    search.set("from", params.from);
  }

  if (params?.to) {
    search.set("to", params.to);
  }

  const query = search.toString();
  const path = `/property-visits/analytics${query ? `?${query}` : ""}`;

  const response = (await apiFetch(path)) as ApiResponse<VisitAnalytics>;
  return response.data;
}
