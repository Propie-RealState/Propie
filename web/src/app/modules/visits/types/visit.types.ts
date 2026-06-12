export const VISIT_STATUSES = [
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
] as const;

export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const VISIT_EVENT_TYPES = [
  "CREATED",
  "CONFIRMED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED",
] as const;

export type VisitEventType = (typeof VISIT_EVENT_TYPES)[number];

export const VISIT_ACTOR_ROLES = ["CLIENT", "OWNER", "AGENT"] as const;

export type VisitActorRole = (typeof VISIT_ACTOR_ROLES)[number];

export const VISIT_LIST_SEGMENTS = [
  "today",
  "upcoming",
  "calendar",
] as const;

export type VisitListSegment = (typeof VISIT_LIST_SEGMENTS)[number];

export type Visit = {
  id: string;
  propertyId: string;
  conversationId: string | null;
  clientId: string;
  agentId: string | null;
  createdBy: string;
  status: VisitStatus;
  scheduledAt: string;
  durationMinutes: number;
  notes: string | null;
  cancelledReason: string | null;
  metadata: Record<string, unknown>;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VisitEvent = {
  id: string;
  visitId: string;
  actorId: string | null;
  actorRole: VisitActorRole | null;
  eventType: VisitEventType;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type VisitAnalytics = {
  created: number;
  completed: number;
  cancelled: number;
  byProperty: Array<{
    propertyId: string;
    propertyTitle: string | null;
    count: number;
  }>;
  byAgent: Array<{
    agentId: string;
    agentName: string | null;
    count: number;
  }>;
  conversionRate: number | null;
};

export type CreateVisitInput = {
  conversationId: string;
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
};

export type RescheduleVisitInput = {
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
};

export type CancelVisitInput = {
  reason?: string;
};

export type VisitDisplayInfo = {
  propertyTitle: string;
  clientName: string;
  agentName: string | null;
  ownerName: string | null;
};

export type VisitActivityItem = {
  eventType: VisitEventType;
  label: string;
  at: string;
  detail?: string;
};
