import type { VisitStatus } from "../types/visit.types";

export class VisitStatusTransitionError extends Error {
  constructor(
    message: string,
    readonly code = "VISIT_NOT_ACTIVE",
  ) {
    super(message);
    this.name = "VisitStatusTransitionError";
  }
}

const ALLOWED_VISIT_STATUS_TRANSITIONS: Record<
  VisitStatus,
  readonly VisitStatus[]
> = {
  SCHEDULED: ["CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"],
  CONFIRMED: ["RESCHEDULED", "COMPLETED", "CANCELLED"],
  RESCHEDULED: ["CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const ACTIVE_VISIT_STATUSES: readonly VisitStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "RESCHEDULED",
];

export function getAllowedVisitStatusTransitions(
  from: VisitStatus,
): readonly VisitStatus[] {
  return ALLOWED_VISIT_STATUS_TRANSITIONS[from] ?? [];
}

export function isActiveVisitStatus(status: VisitStatus): boolean {
  return ACTIVE_VISIT_STATUSES.includes(status);
}

export function assertVisitStatusTransition(
  from: VisitStatus,
  to: VisitStatus,
): void {
  const allowed = getAllowedVisitStatusTransitions(from);

  if (!allowed.includes(to)) {
    throw new VisitStatusTransitionError(
      `Cannot transition visit status from ${from} to ${to}`,
    );
  }
}
