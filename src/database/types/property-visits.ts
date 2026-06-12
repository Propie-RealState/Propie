import { z } from "zod";

import {
  VISIT_ACTOR_ROLES,
  VISIT_EVENT_TYPES,
  VISIT_STATUSES,
} from "@/modules/property-visits/types/visit.types";

export const VisitStatusSchema = z.enum(VISIT_STATUSES);

export type VisitStatusRow = z.infer<typeof VisitStatusSchema>;

export const VisitEventTypeSchema = z.enum(VISIT_EVENT_TYPES);

export const VisitActorRoleSchema = z.enum(VISIT_ACTOR_ROLES);

export const PropertyVisitRowSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  conversation_id: z.string().uuid().nullable(),
  client_id: z.string().uuid(),
  agent_id: z.string().uuid().nullable(),
  created_by: z.string().uuid(),
  status: VisitStatusSchema,
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int(),
  notes: z.string().nullable(),
  cancelled_reason: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  confirmed_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  cancelled_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type PropertyVisitRow = z.infer<typeof PropertyVisitRowSchema>;

export const PropertyVisitEventRowSchema = z.object({
  id: z.string().uuid(),
  visit_id: z.string().uuid(),
  actor_id: z.string().uuid().nullable(),
  actor_role: VisitActorRoleSchema.nullable(),
  event_type: VisitEventTypeSchema,
  payload: z.record(z.string(), z.unknown()),
  created_at: z.string().datetime(),
});

export type PropertyVisitEventRow = z.infer<
  typeof PropertyVisitEventRowSchema
>;

export const PropertyVisitReminderRowSchema = z.object({
  id: z.string().uuid(),
  visit_id: z.string().uuid(),
  offset_minutes: z.number().int(),
  remind_at: z.string().datetime(),
  sent_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

export type PropertyVisitReminderRow = z.infer<
  typeof PropertyVisitReminderRowSchema
>;
