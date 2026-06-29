const DEFAULT_EXPIRY_MINUTES = 15;

export function getEmailVerificationExpiryMinutes(): number {
  const raw =
    process.env.EMAIL_VERIFICATION_EXPIRY_MINUTES ??
    process.env.DEPLOY_EMAIL_VERIFICATION_EXPIRY_MINUTES ??
    process.env.LOCAL_EMAIL_VERIFICATION_EXPIRY_MINUTES;

  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_EXPIRY_MINUTES;

  if (!Number.isFinite(parsed) || parsed < 5 || parsed > 60) {
    return DEFAULT_EXPIRY_MINUTES;
  }

  return parsed;
}

export function getEmailVerificationExpiryMs(): number {
  return getEmailVerificationExpiryMinutes() * 60 * 1000;
}
