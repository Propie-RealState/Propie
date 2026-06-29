import type {
  ResolvedEmail,
  SendEmailResult,
} from "../../domain/email.types";

export interface EmailProvider {
  readonly name: string;

  sendEmail(email: ResolvedEmail): Promise<SendEmailResult>;
}
