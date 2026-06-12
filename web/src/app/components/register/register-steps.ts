const STEP_ORDER = [
  "role",
  "verification",
  "personal-data",
  "security",
  "profile-photo",
  "role-info",
] as const;

const PATH_TO_STEP: Record<string, number> = {
  owner: 1,
  agent: 1,
  client: 1,
  verification: 2,
  "personal-data": 3,
  security: 4,
  "profile-photo": 5,
  "owner-info": 6,
  "agent-info": 6,
  "client-info": 6,
};

export const REGISTER_STEP_TOTAL = STEP_ORDER.length;

export function getRegisterStep(
  pathname: string,
): { current: number; total: number } | null {
  const segment = pathname.split("/").filter(Boolean).pop();

  if (!segment || segment === "registro") {
    return null;
  }

  const current = PATH_TO_STEP[segment];

  if (!current) {
    return null;
  }

  return { current, total: REGISTER_STEP_TOTAL };
}
