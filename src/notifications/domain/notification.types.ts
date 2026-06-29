import type { EmailTemplateId } from "../templates/email-template.registry";

export const NOTIFICATION_CHANNELS = {
  EMAIL: "email",
} as const;

export type NotificationChannel =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];

export type SendNotificationInput = {
  channel: NotificationChannel;
  template: EmailTemplateId;
  recipient: string;
  payload: Record<string, unknown>;
};

export type SendNotificationResult = {
  channel: NotificationChannel;
  provider: string;
  messageId: string | null;
};
