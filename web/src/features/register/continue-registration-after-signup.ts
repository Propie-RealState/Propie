import { isEmailVerificationEnabled } from "../../lib/feature-flags";
import { completeSignupSession } from "./complete-signup-session";
import type { RegisterRole } from "../../context/RegisterContext";

type AuthSession = Parameters<typeof completeSignupSession>[0];

export async function continueRegistrationAfterSignup(
  auth: AuthSession,
  data: {
    email: string;
    password: string;
    role: RegisterRole | null;
  },
  handlers: {
    onVerificationRequired: () => void;
    onSignupComplete: () => void;
  },
): Promise<void> {
  if (isEmailVerificationEnabled()) {
    handlers.onVerificationRequired();
    return;
  }

  await completeSignupSession(auth, data);
  handlers.onSignupComplete();
}
