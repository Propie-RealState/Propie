import type { EmailProvider } from "./ports/email-provider.port";
import type {
  SendNotificationInput,
  SendNotificationResult,
} from "../domain/notification.types";
import { NOTIFICATION_CHANNELS } from "../domain/notification.types";
import { resolveEmailTemplate } from "../templates/email-template.registry";

/**
 * Orchestrates outbound notifications across channels.
 * Application code must use this service — never a provider directly.
 */
export class NotificationService {
  constructor(private readonly emailProvider: EmailProvider) {}

  async send(input: SendNotificationInput): Promise<SendNotificationResult> {
    switch (input.channel) {
      case NOTIFICATION_CHANNELS.EMAIL:
        return this.sendViaEmail(input);
      default: {
        const channel: never = input.channel;
        throw new Error(`Unsupported notification channel: ${channel}`);
      }
    }
  }

  private async sendViaEmail(
    input: SendNotificationInput,
  ): Promise<SendNotificationResult> {
    const template = resolveEmailTemplate(input.template);

    const result = await this.emailProvider.sendEmail({
      recipient: input.recipient,
      subject: template.subject,
      template: template.id,
      payload: input.payload,
    });

    return {
      channel: NOTIFICATION_CHANNELS.EMAIL,
      provider: result.provider,
      messageId: result.messageId,
    };
  }
}
