import type { VisitStatus } from "../types/visit.types";
import {
  getVisitStatusColor,
  getVisitStatusLabel,
} from "../utils/visit-ui";

type VisitStatusBadgeProps = {
  status: VisitStatus;
};

export function VisitStatusBadge({ status }: VisitStatusBadgeProps) {
  const color = getVisitStatusColor(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: `${color}18`,
      }}
    >
      {getVisitStatusLabel(status)}
    </span>
  );
}
