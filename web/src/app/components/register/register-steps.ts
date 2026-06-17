const PATH_TO_STEP: Record<string, number> = {
  account: 1,
  profile: 2,
  verification: 3,
};

export const REGISTER_STEP_TOTAL = 3;

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
