import {
  PROPERTY_STATUSES,
  type PropertyLifecycleStatus,
} from "../constants/property-status.constants";

export class PropertyStatusTransitionError extends Error {
  constructor(
    message: string,
    readonly code = "INVALID_STATUS_TRANSITION",
  ) {
    super(message);
    this.name = "PropertyStatusTransitionError";
  }
}

/**
 * Published lifecycle transitions. Draft → ACTIVE happens only via publish.
 */
const ALLOWED_PROPERTY_STATUS_TRANSITIONS: Record<
  PropertyLifecycleStatus,
  readonly PropertyLifecycleStatus[]
> = {
  [PROPERTY_STATUSES.ACTIVE]: [
    PROPERTY_STATUSES.PAUSED,
    PROPERTY_STATUSES.RESERVED,
    PROPERTY_STATUSES.FINALIZED,
  ],
  [PROPERTY_STATUSES.PAUSED]: [
    PROPERTY_STATUSES.ACTIVE,
    PROPERTY_STATUSES.RESERVED,
    PROPERTY_STATUSES.FINALIZED,
  ],
  [PROPERTY_STATUSES.RESERVED]: [
    PROPERTY_STATUSES.ACTIVE,
    PROPERTY_STATUSES.PAUSED,
    PROPERTY_STATUSES.FINALIZED,
  ],
  [PROPERTY_STATUSES.FINALIZED]: [],
};

export function getAllowedPropertyStatusTransitions(
  from: PropertyLifecycleStatus,
): readonly PropertyLifecycleStatus[] {
  return ALLOWED_PROPERTY_STATUS_TRANSITIONS[from] ?? [];
}

export function assertPropertyStatusTransition(
  from: PropertyLifecycleStatus,
  to: PropertyLifecycleStatus,
): void {
  if (from === to) {
    return;
  }

  const allowed = getAllowedPropertyStatusTransitions(from);

  if (!allowed.includes(to)) {
    throw new PropertyStatusTransitionError(
      `Cannot transition property status from ${from} to ${to}`,
    );
  }
}
