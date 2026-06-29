import type { EmailTemplateId } from "../templates/email-template.registry";
import { EMAIL_TEMPLATE } from "../templates/email-template.registry";

export type ResolvedEmail = {
  recipient: string;
  subject: string;
  template: EmailTemplateId;
  payload: Record<string, unknown>;
};

export type SendEmailResult = {
  provider: string;
  messageId: string | null;
};
