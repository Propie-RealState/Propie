const isProduction = process.env.NODE_ENV === "production";

export const EMAIL_PROVIDER_NAMES = [
  "development",
  "resend",
  "sendgrid",
  "ses",
] as const;

export type EmailProviderName = (typeof EMAIL_PROVIDER_NAMES)[number];

function parseEmailProviderName(
  value: string | undefined,
): EmailProviderName | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    (EMAIL_PROVIDER_NAMES as readonly string[]).includes(normalized)
  ) {
    return normalized as EmailProviderName;
  }

  return null;
}

export function getEmailProviderName(): EmailProviderName {
  const configured = isProduction
    ? process.env.DEPLOY_EMAIL_PROVIDER ?? process.env.EMAIL_PROVIDER
    : process.env.LOCAL_EMAIL_PROVIDER ?? process.env.EMAIL_PROVIDER;

  return parseEmailProviderName(configured) ?? "development";
}
