/** Canonical wizard progress — never stores secrets. */
export type RegistrationCompletedStep =
  | "account"
  | "personal"
  | "security"
  | "role";

export type RegistrationProgress = {
  lastCompletedStep: RegistrationCompletedStep | null;
};

export type RegistrationProgressSource = {
  role: "OWNER" | "AGENT" | "CLIENT" | null;
  registrationProgress: RegistrationProgress;
};

function getRegisterAccountRoute(
  role: RegistrationProgressSource["role"],
): string {
  if (role === "AGENT") return "/registro/agent";
  if (role === "CLIENT") return "/registro/client";
  return "/registro/owner";
}

function getRegisterProfileRoute(
  role: RegistrationProgressSource["role"],
): string {
  if (role === "AGENT") return "/registro/agent-info";
  if (role === "CLIENT") return "/registro/client-info";
  return "/registro/owner-info";
}

const STEP_ORDER: readonly RegistrationCompletedStep[] = [
  "account",
  "personal",
  "security",
  "role",
] as const;

export const emptyRegistrationProgress = (): RegistrationProgress => ({
  lastCompletedStep: null,
});

export function normalizeRegistrationProgress(
  value: unknown,
): RegistrationProgress {
  if (!value || typeof value !== "object") {
    return emptyRegistrationProgress();
  }
  const step = (value as RegistrationProgress).lastCompletedStep;
  if (
    step === "account" ||
    step === "personal" ||
    step === "security" ||
    step === "role"
  ) {
    return { lastCompletedStep: step };
  }
  return emptyRegistrationProgress();
}

export function hasCompletedRegistrationStep(
  progress: RegistrationProgress,
  step: RegistrationCompletedStep,
): boolean {
  const current = progress.lastCompletedStep;
  if (!current) return false;
  return STEP_ORDER.indexOf(current) >= STEP_ORDER.indexOf(step);
}

/** Advance only forward; never regress. */
export function advanceRegistrationProgress(
  progress: RegistrationProgress,
  step: RegistrationCompletedStep,
): RegistrationProgress {
  if (!hasCompletedRegistrationStep(progress, step)) {
    return { lastCompletedStep: step };
  }
  return progress;
}

type RouteKind =
  | "choice"
  | "account"
  | "personal"
  | "security"
  | "profilePhoto"
  | "role"
  | "verification"
  | "unknown";

function classifyPath(pathname: string): RouteKind {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/registro") return "choice";
  if (
    path === "/registro/owner" ||
    path === "/registro/agent" ||
    path === "/registro/client"
  ) {
    return "account";
  }
  if (path === "/registro/personal-data") return "personal";
  if (path === "/registro/security") return "security";
  if (path === "/registro/profile-photo") return "profilePhoto";
  if (
    path === "/registro/owner-info" ||
    path === "/registro/agent-info" ||
    path === "/registro/client-info"
  ) {
    return "role";
  }
  if (path === "/registro/verification") return "verification";
  return "unknown";
}

function accountPathForRole(
  role: RegistrationProgressSource["role"],
): string {
  if (!role) return "/registro";
  return getRegisterAccountRoute(role);
}

function rolePathMatches(
  pathname: string,
  role: RegistrationProgressSource["role"],
): boolean {
  if (!role) return false;
  return pathname.replace(/\/+$/, "") === getRegisterProfileRoute(role);
}

function accountPathMatches(
  pathname: string,
  role: RegistrationProgressSource["role"],
): boolean {
  if (!role) return true;
  return pathname.replace(/\/+$/, "") === getRegisterAccountRoute(role);
}

/**
 * First step the user still needs to complete (resume target).
 * Based only on registrationProgress — never secrets / Finalizar validators.
 */
export function resolveFirstIncompleteRoute(
  data: RegistrationProgressSource,
): string {
  const progress = data.registrationProgress;

  if (!hasCompletedRegistrationStep(progress, "account")) {
    return accountPathForRole(data.role);
  }
  if (!hasCompletedRegistrationStep(progress, "personal")) {
    return "/registro/personal-data";
  }
  if (!hasCompletedRegistrationStep(progress, "security")) {
    return "/registro/security";
  }
  if (!hasCompletedRegistrationStep(progress, "role")) {
    return "/registro/profile-photo";
  }
  return getRegisterProfileRoute(data.role);
}

/**
 * If the current path is not allowed, returns the redirect target.
 * Returns null when the user may stay on the current path.
 *
 * Allowed = any step whose prerequisites are satisfied (back navigation OK).
 * Forward skip → first incomplete step.
 */
export function resolveRegistrationRedirect(
  pathname: string,
  data: RegistrationProgressSource,
): string | null {
  const kind = classifyPath(pathname);
  const progress = data.registrationProgress;

  if (kind === "choice" || kind === "verification") {
    return null;
  }

  if (kind === "unknown") {
    return resolveFirstIncompleteRoute(data);
  }

  if (kind === "account") {
    if (!accountPathMatches(pathname, data.role) && data.role) {
      return accountPathForRole(data.role);
    }
    return null;
  }

  if (kind === "personal") {
    if (!hasCompletedRegistrationStep(progress, "account")) {
      return resolveFirstIncompleteRoute(data);
    }
    return null;
  }

  if (kind === "security") {
    if (!hasCompletedRegistrationStep(progress, "personal")) {
      return resolveFirstIncompleteRoute(data);
    }
    return null;
  }

  if (kind === "profilePhoto") {
    if (!hasCompletedRegistrationStep(progress, "security")) {
      return resolveFirstIncompleteRoute(data);
    }
    return null;
  }

  if (kind === "role") {
    if (!hasCompletedRegistrationStep(progress, "security")) {
      return resolveFirstIncompleteRoute(data);
    }
    if (data.role && !rolePathMatches(pathname, data.role)) {
      return getRegisterProfileRoute(data.role);
    }
    return null;
  }

  return null;
}
