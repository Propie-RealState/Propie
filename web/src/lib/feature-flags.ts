export function isPublicRegistrationEnabled(): boolean {
  return import.meta.env.VITE_PUBLIC_REGISTRATION_ENABLED === "true";
}

export function isEmailVerificationEnabled(): boolean {
  return import.meta.env.VITE_EMAIL_VERIFICATION_ENABLED === "true";
}

/**
 * Statically-configured feature flags.
 *
 * Social auth (Google / Apple sign-in) is not implemented yet, so it stays
 * disabled and hidden from the UI. Flip `socialAuth` to `true` once the
 * providers are wired up to re-enable the buttons everywhere.
 */
export const FEATURES = {
  socialAuth: false,
} as const;

export function isSocialAuthEnabled(): boolean {
  return FEATURES.socialAuth;
}