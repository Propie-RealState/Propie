export function isPublicRegistrationEnabled(): boolean {
  return process.env.PUBLIC_REGISTRATION_ENABLED === "true";
}
