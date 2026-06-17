import type { RegisterData } from "../../../context/RegisterContext";
import {
  validateBasicProfileStep,
  validateUnifiedAccountStep,
} from "./schemas";
import { validateVerificationCode } from "./validators";

/** Validates account + profile + email verification for unified flow. */
export function ensureMinimalRegistrationReady(
  data: RegisterData,
):
  | { valid: true }
  | { valid: false; route: string; errors: Record<string, string | undefined> } {
  const account = validateUnifiedAccountStep(data);
  if (!account.valid) {
    return { valid: false, route: "/registro/account", errors: account.errors };
  }

  const profile = validateBasicProfileStep(data);
  if (!profile.valid) {
    return { valid: false, route: "/registro/profile", errors: profile.errors };
  }

  const verification = validateVerificationCode(data.verificationCode);
  if (!verification.valid) {
    return {
      valid: false,
      route: "/registro/verification",
      errors: { verificationCode: verification.error },
    };
  }

  return { valid: true };
}
