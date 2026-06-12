import { isAgentRole, isOwnerRole } from "../../../../lib/roles";

import type {
  Visit,
  VisitActivityItem,
  VisitEventType,
  VisitStatus,
} from "../types/visit.types";

const ACTIVE_STATUSES = new Set<VisitStatus>([
  "SCHEDULED",
  "CONFIRMED",
  "RESCHEDULED",
]);

export function formatVisitDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatVisitTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatVisitDateTime(iso: string) {
  return `${formatVisitDate(iso)} · ${formatVisitTime(iso)}`;
}

export function formatUserName(
  firstName?: string | null,
  lastName?: string | null,
  fallback = "Usuario",
) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
}

export function getVisitStatusLabel(status: VisitStatus) {
  switch (status) {
    case "SCHEDULED":
      return "Programada";
    case "CONFIRMED":
      return "Confirmada";
    case "COMPLETED":
      return "Completada";
    case "CANCELLED":
      return "Cancelada";
    case "RESCHEDULED":
      return "Reprogramada";
    default:
      return status;
  }
}

export function getVisitStatusColor(status: VisitStatus) {
  switch (status) {
    case "SCHEDULED":
      return "#3b82f6";
    case "CONFIRMED":
      return "#10b981";
    case "COMPLETED":
      return "#6b7280";
    case "CANCELLED":
      return "#ef4444";
    case "RESCHEDULED":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
}

export function getVisitEventLabel(eventType: VisitEventType) {
  switch (eventType) {
    case "CREATED":
      return "Visita creada";
    case "CONFIRMED":
      return "Visita confirmada";
    case "RESCHEDULED":
      return "Visita reprogramada";
    case "CANCELLED":
      return "Visita cancelada";
    case "COMPLETED":
      return "Visita completada";
    default:
      return eventType;
  }
}

export function buildVisitActivityTimeline(visit: Visit): VisitActivityItem[] {
  const items: VisitActivityItem[] = [
    {
      eventType: "CREATED",
      label: getVisitEventLabel("CREATED"),
      at: visit.createdAt,
    },
  ];

  const previousScheduledAt = visit.metadata.previousScheduledAt;

  if (
    typeof previousScheduledAt === "string"
    && visit.status === "RESCHEDULED"
  ) {
    items.push({
      eventType: "RESCHEDULED",
      label: getVisitEventLabel("RESCHEDULED"),
      at: visit.updatedAt,
      detail: `Antes: ${formatVisitDateTime(previousScheduledAt)}`,
    });
  }

  if (visit.confirmedAt) {
    items.push({
      eventType: "CONFIRMED",
      label: getVisitEventLabel("CONFIRMED"),
      at: visit.confirmedAt,
    });
  }

  if (visit.completedAt) {
    items.push({
      eventType: "COMPLETED",
      label: getVisitEventLabel("COMPLETED"),
      at: visit.completedAt,
    });
  }

  if (visit.cancelledAt) {
    items.push({
      eventType: "CANCELLED",
      label: getVisitEventLabel("CANCELLED"),
      at: visit.cancelledAt,
      detail: visit.cancelledReason ?? undefined,
    });
  }

  return items.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

export type VisitActions = {
  canConfirm: boolean;
  canCancel: boolean;
  canReschedule: boolean;
  canComplete: boolean;
};

export function getVisitActions(
  visit: Visit,
  userId: string | undefined,
  userRole: string | null | undefined,
): VisitActions {
  if (!userId || !ACTIVE_STATUSES.has(visit.status)) {
    return {
      canConfirm: false,
      canCancel: false,
      canReschedule: false,
      canComplete: false,
    };
  }

  const isClient = visit.clientId === userId;
  const canOperate = isAgentRole(userRole) || isOwnerRole(userRole);

  return {
    canConfirm: isClient || canOperate,
    canCancel: isClient || canOperate,
    canReschedule: canOperate,
    canComplete: canOperate,
  };
}

export function toIsoDateTime(date: string, time: string) {
  const value = new Date(`${date}T${time}:00`);
  return value.toISOString();
}

export function getWeekRange(reference = new Date()) {
  const start = new Date(reference);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getWeekDays(reference = new Date()) {
  const { start } = getWeekRange(reference);
  const days: Date[] = [];

  for (let index = 0; index < 7; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    days.push(day);
  }

  return days;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}
