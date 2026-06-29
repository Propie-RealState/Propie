import { createNotificationService } from "./infrastructure/di/create-notification-service";

export { NotificationService } from "./application/notification.service";
export type {
  SendNotificationInput,
  SendNotificationResult,
  NotificationChannel,
} from "./domain/notification.types";
export { NOTIFICATION_CHANNELS } from "./domain/notification.types";
export {
  EMAIL_TEMPLATE,
  EMAIL_TEMPLATE_REGISTRY,
  resolveEmailTemplate,
  type EmailTemplateDefinition,
  type EmailTemplateId,
} from "./templates";
export { createNotificationService } from "./infrastructure/di/create-notification-service";

/** Application-wide outbound notification entry point. */
export const notificationService = createNotificationService();
