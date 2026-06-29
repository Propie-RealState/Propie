export function isPublicRegistrationEnabled(): boolean {
  return import.meta.env.VITE_PUBLIC_REGISTRATION_ENABLED === "true";
}

export function isEmailVerificationEnabled(): boolean {
  return import.meta.env.VITE_EMAIL_VERIFICATION_ENABLED === "true";
}