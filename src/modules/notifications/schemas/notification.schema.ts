import { z } from "zod";

import { PaginationSchema } from "@/database/shared/pagination";

import { NOTIFICATION_TYPES } from "../types/notification.types";

const NotificationTypeSchema = z.enum(
  Object.values(NOTIFICATION_TYPES) as [
    (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES],
    ...(typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES][],
  ],
);

export const ListNotificationsQuerySchema = PaginationSchema.extend({
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const UpdateNotificationPreferencesSchema = z.object({
  nearbyEnabled: z.boolean().optional(),
  favoritesEnabled: z.boolean().optional(),
  messagesEnabled: z.boolean().optional(),
  agentApplicationsEnabled: z.boolean().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().int().positive().max(100000).optional(),
});

export type ListNotificationsQuery = z.infer<
  typeof ListNotificationsQuerySchema
>;

export type UpdateNotificationPreferencesInput = z.infer<
  typeof UpdateNotificationPreferencesSchema
>;

export { NotificationTypeSchema };

export const RegisterPushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  platform: z.string().max(32).optional(),
});

export const UnregisterPushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
});

export type RegisterPushSubscriptionInput = z.infer<
  typeof RegisterPushSubscriptionSchema
>;

export type UnregisterPushSubscriptionInput = z.infer<
  typeof UnregisterPushSubscriptionSchema
>;
