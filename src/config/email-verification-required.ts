// TODO: Re-enable EMAIL_VERIFICATION_REQUIRED after ResendEmailProvider is deployed.
const isProduction = process.env.NODE_ENV === "production";

function readEmailVerificationRequiredFlag(): string | undefined {
  if (isProduction) {
    return (
      process.env.DEPLOY_EMAIL_VERIFICATION_REQUIRED ??
      process.env.EMAIL_VERIFICATION_REQUIRED
    );
  }

  return (
    process.env.LOCAL_EMAIL_VERIFICATION_REQUIRED ??
    process.env.EMAIL_VERIFICATION_REQUIRED
  );
}

export function isEmailVerificationRequired(): boolean {
  return readEmailVerificationRequiredFlag() === "true";
}
