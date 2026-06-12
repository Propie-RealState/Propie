import { z } from "zod";

import { VISIT_LIST_SEGMENTS } from "../types/visit.types";

export const VisitIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const CreateVisitSchema = z.object({
  conversationId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(5).max(480).default(30),
  notes: z.string().max(2000).optional(),
});

export const ListVisitsQuerySchema = z.object({
  segment: z.enum(VISIT_LIST_SEGMENTS).default("upcoming"),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const RescheduleVisitSchema = z.object({
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(5).max(480).optional(),
  notes: z.string().max(2000).optional(),
});

export const CancelVisitSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const VisitAnalyticsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
