import { NotificationService } from "../../application/notification.service";
import { createEmailProvider } from "../providers/email/create-email-provider";

export function createNotificationService(): NotificationService {
  return new NotificationService(createEmailProvider());
}
