import { validateVerificationCodeFormat } from "../validation";

export function isRateLimitError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("statusCode" in error && (error as { statusCode?: number }).statusCode === 429) {
    return true;
  }

  const code =
    "error" in error &&
    typeof (error as { error?: { code?: string } }).error?.code === "string"
      ? (error as { error: { code: string } }).error.code
      : null;

  return code === "TOO_MANY_REQUESTS" || code === "RATE_LIMIT_EXCEEDED";
}

export function mapVerificationError(error: unknown): string {
  if (isRateLimitError(error)) {
    return "Demasiados intentos. Esperá unos minutos o cambiá el código y volvé a intentar.";
  }

  const code =
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: { code?: string } }).error?.code === "string"
      ? (error as { error: { code: string } }).error.code
      : null;

  switch (code) {
    case "INVALID_VERIFICATION_CODE":
      return "Código incorrecto. Revisá el código e intentá de nuevo.";
    case "VERIFICATION_CODE_EXPIRED":
      return "El código expiró. Pedí uno nuevo.";
    case "VERIFICATION_CODE_ALREADY_USED":
      return "Este código ya fue usado. Pedí uno nuevo.";
    case "EMAIL_ALREADY_VERIFIED":
      return "Tu email ya está verificado.";
    case "VERIFICATION_NOT_FOUND":
      return "No encontramos un código activo. Pedí uno nuevo.";
    case "ACCOUNT_INACTIVE":
      return "Esta cuenta está inactiva.";
    default:
      return "No pudimos verificar tu email. Intentá de nuevo.";
  }
}

export function canAutoSubmitVerification(input: {
  code: string;
  emailVerified: boolean;
  isSubmitting: boolean;
  lastSubmittedCode: string | null;
  rateLimited: boolean;
}): boolean {
  if (input.emailVerified || input.isSubmitting || input.rateLimited) {
    return false;
  }

  if (input.code.length !== 6) {
    return false;
  }

  if (!validateVerificationCodeFormat(input.code).valid) {
    return false;
  }

  if (input.lastSubmittedCode === input.code) {
    return false;
  }

  return true;
}

export function shouldTriggerAutoSubmit(
  previousCode: string,
  nextCode: string,
): boolean {
  return (
    nextCode.length === 6 &&
    previousCode.length < 6 &&
    validateVerificationCodeFormat(nextCode).valid
  );
}

const verificationBlockKey = (email: string) =>
  `propie.verify.blocked:${email.trim().toLowerCase()}`;

export function readVerificationBlock(email: string): string | null {
  if (typeof globalThis.sessionStorage === "undefined" || !email) {
    return null;
  }

  return globalThis.sessionStorage.getItem(verificationBlockKey(email));
}

export function writeVerificationBlock(email: string, code: string) {
  if (typeof globalThis.sessionStorage === "undefined" || !email) {
    return;
  }

  globalThis.sessionStorage.setItem(verificationBlockKey(email), code);
}

export function clearVerificationBlock(email: string) {
  if (typeof globalThis.sessionStorage === "undefined" || !email) {
    return;
  }

  globalThis.sessionStorage.removeItem(verificationBlockKey(email));
}

export function canManualSubmitVerification(input: {
  code: string;
  emailVerified: boolean;
  isSubmitting: boolean;
}): boolean {
  if (input.emailVerified || input.isSubmitting) {
    return false;
  }

  if (input.code.length !== 6) {
    return false;
  }

  return validateVerificationCodeFormat(input.code).valid;
}
