import type { PropertyStatus } from "../types/my-properties.types";

export const PROPERTY_STATUS_OPTIONS: {
  value: PropertyStatus;
  label: string;
}[] = [
  { value: "ACTIVE", label: "Activa" },
  { value: "PAUSED", label: "Pausada" },
  { value: "RESERVED", label: "Reservada" },
  { value: "FINALIZED", label: "Finalizada" },
];

export function getPropertyStatusLabel(status: PropertyStatus | string): string {
  return (
    PROPERTY_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export function getPropertyStatusStyle(status: PropertyStatus | string) {
  switch (status) {
    case "ACTIVE":
      return { bg: "#ecfdf3", text: "#027a48", ring: "#a7f3d0" };
    case "PAUSED":
      return { bg: "#fff7ed", text: "#b54708", ring: "#fed7aa" };
    case "RESERVED":
      return { bg: "#eff6ff", text: "#1d4ed8", ring: "#bfdbfe" };
    case "FINALIZED":
      return { bg: "#f3f4f6", text: "#6b7280", ring: "#e5e7eb" };
    default:
      return { bg: "#f3f4f6", text: "#6b7280", ring: "#e5e7eb" };
  }
}
