export type PublishWizardStepId =
  | "publicar"
  | "fotos-videos"
  | "informacion"
  | "comercializacion"
  | "revision";

export type PublishWizardStep = {
  id: PublishWizardStepId;
  /** Absolute path within the app router. */
  path: string;
};

const PUBLISH_WIZARD_STEPS: readonly PublishWizardStep[] = [
  { id: "publicar", path: "/publicar" },
  { id: "fotos-videos", path: "/publicar/fotos-videos" },
  { id: "informacion", path: "/publicar/informacion" },
  { id: "comercializacion", path: "/publicar/comercializacion" },
  { id: "revision", path: "/publicar/revision" },
] as const;

const AGENT_EXCLUDED_STEP_IDS = new Set<PublishWizardStepId>([
  "comercializacion",
]);

export function getPublishWizardSteps(
  isAgent: boolean,
): PublishWizardStep[] {
  if (!isAgent) {
    return [...PUBLISH_WIZARD_STEPS];
  }

  return PUBLISH_WIZARD_STEPS.filter(
    (step) => !AGENT_EXCLUDED_STEP_IDS.has(step.id),
  );
}

export function getPublishWizardStepSegment(
  pathname: string,
): PublishWizardStepId {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "publicar";

  const match = PUBLISH_WIZARD_STEPS.find((step) => step.id === segment);
  return match?.id ?? "publicar";
}

export function getPublishWizardProgress(
  pathname: string,
  isAgent: boolean,
): { current: number; total: number; progress: number } {
  const steps = getPublishWizardSteps(isAgent);
  const segment = getPublishWizardStepSegment(pathname);
  let index = steps.findIndex((step) => step.id === segment);

  if (index < 0) {
    const nextPath = getNextPublishWizardPath(segment, isAgent);
    if (nextPath) {
      const nextSegment = getPublishWizardStepSegment(nextPath);
      index = steps.findIndex((step) => step.id === nextSegment);
    }
  }

  const current = index >= 0 ? index + 1 : 1;
  const total = steps.length;
  const progress = (current / total) * 100;

  return { current, total, progress };
}

function resolveSegment(
  pathnameOrSegment: string,
): PublishWizardStepId {
  return pathnameOrSegment.includes("/")
    ? getPublishWizardStepSegment(pathnameOrSegment)
    : (pathnameOrSegment as PublishWizardStepId);
}

/**
 * Resolves the next visible step path.
 * If the current segment is excluded for the role (e.g. Agent on
 * commercialization), advances to the next step that remains in the
 * filtered list.
 */
export function getNextPublishWizardPath(
  pathnameOrSegment: string,
  isAgent: boolean,
): string | null {
  const steps = getPublishWizardSteps(isAgent);
  const segment = resolveSegment(pathnameOrSegment);
  const indexInVisible = steps.findIndex((step) => step.id === segment);

  if (indexInVisible >= 0) {
    return steps[indexInVisible + 1]?.path ?? null;
  }

  const indexInFull = PUBLISH_WIZARD_STEPS.findIndex(
    (step) => step.id === segment,
  );

  if (indexInFull < 0) {
    return null;
  }

  for (let i = indexInFull + 1; i < PUBLISH_WIZARD_STEPS.length; i += 1) {
    const candidate = PUBLISH_WIZARD_STEPS[i];
    if (steps.some((step) => step.id === candidate.id)) {
      return candidate.path;
    }
  }

  return null;
}

export function getPreviousPublishWizardPath(
  pathnameOrSegment: string,
  isAgent: boolean,
): string | null {
  const steps = getPublishWizardSteps(isAgent);
  const segment = resolveSegment(pathnameOrSegment);
  const indexInVisible = steps.findIndex((step) => step.id === segment);

  if (indexInVisible > 0) {
    return steps[indexInVisible - 1]?.path ?? null;
  }

  const indexInFull = PUBLISH_WIZARD_STEPS.findIndex(
    (step) => step.id === segment,
  );

  if (indexInFull <= 0) {
    return null;
  }

  for (let i = indexInFull - 1; i >= 0; i -= 1) {
    const candidate = PUBLISH_WIZARD_STEPS[i];
    if (steps.some((step) => step.id === candidate.id)) {
      return candidate.path;
    }
  }

  return null;
}
