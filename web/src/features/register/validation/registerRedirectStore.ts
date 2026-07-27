import type { RegisterRedirectState } from "./registerSubmit";

let pendingRedirect: RegisterRedirectState | null = null;
/** Bumps on each publish so identical payloads can still be consumed once each. */
let redirectGeneration = 0;

export function publishRegisterRedirect(state: RegisterRedirectState) {
  pendingRedirect = state;
  redirectGeneration += 1;
}

export function readRegisterRedirect(): RegisterRedirectState | null {
  return pendingRedirect;
}

export function getRegisterRedirectGeneration(): number {
  return redirectGeneration;
}

export function clearRegisterRedirect() {
  pendingRedirect = null;
}

export function hasRegisterRedirectContent(
  state: RegisterRedirectState | null | undefined,
): boolean {
  if (!state) return false;
  const fieldCount = state.registerFieldErrors
    ? Object.keys(state.registerFieldErrors).length
    : 0;
  return Boolean(fieldCount > 0 || state.registerFormError || state.fromFinalSubmit);
}
