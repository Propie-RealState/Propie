import {
  getEmailProviderName,
  type EmailProviderName,
} from "@/config/email-provider";

import type { EmailProvider } from "../../../application/ports/email-provider.port";
import { DevelopmentEmailProvider } from "./development-email.provider";

function unsupportedProvider(name: EmailProviderName): never {
  throw new Error(
    `Email provider "${name}" is not implemented yet. Set EMAIL_PROVIDER=development.`,
  );
}

export function createEmailProvider(): EmailProvider {
  const providerName = getEmailProviderName();

  switch (providerName) {
    case "development":
      return new DevelopmentEmailProvider();
    case "resend":
    case "sendgrid":
    case "ses":
      return unsupportedProvider(providerName);
    default:
      return unsupportedProvider(providerName);
  }
}
