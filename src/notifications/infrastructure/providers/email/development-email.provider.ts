import type { EmailProvider } from "../../../application/ports/email-provider.port";
import type {
  ResolvedEmail,
  SendEmailResult,
} from "../../../domain/email.types";
import { EMAIL_TEMPLATE } from "../../../templates/email-template.registry";

export class DevelopmentEmailProvider implements EmailProvider {
  readonly name = "development";

  async sendEmail(email: ResolvedEmail): Promise<SendEmailResult> {
    if (email.template === EMAIL_TEMPLATE.VERIFY_EMAIL) {
      console.info(`
================================================
EMAIL VERIFICATION
Recipient: ${email.recipient}
Verification Code: ${email.payload.code ?? "(missing)"}
Template: VERIFY_EMAIL
Payload: ${JSON.stringify(email.payload)}
================================================
`);
    } else {
      console.info("[DevelopmentEmailProvider] sendEmail", {
        recipient: email.recipient,
        subject: email.subject,
        template: email.template,
        payload: email.payload,
      });
    }

    return {
      provider: this.name,
      messageId: null,
    };
  }
}
