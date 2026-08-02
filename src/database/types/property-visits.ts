import type {
  VisitActorRole,
  VisitEventType,
  VisitStatus,
} from "@/modules/property-visits/types/visit.types";

export type VisitStatusRow = VisitStatus;

export type PropertyVisitRow = {
  id: string;
  property_id: string;
  conversation_id: string | null;
  client_id: string;
  agent_id: string | null;
  created_by: string;
  status: VisitStatus;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
  cancelled_reason: string | null;
  metadata: Record<string, unknown>;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyVisitEventRow = {
  id: string;
  visit_id: string;
  actor_id: string | null;
  actor_role: VisitActorRole | null;
  event_type: VisitEventType;
  payload: Record<string, unknown>;
  created_at: string;
};

export type PropertyVisitReminderRow = {
  id: string;
  visit_id: string;
  offset_minutes: number;
  remind_at: string;
  sent_at: string | null;
  created_at: string;
};
