import type { CSSProperties, ReactNode } from "react";

const ERROR_COLOR = "#C52E3E";
const SUCCESS_COLOR = "#34C759";
const DEFAULT_BORDER = "#e5e5ea";

export type FieldVisualState = "default" | "focus" | "error" | "success";

export function getFieldBorder(state: FieldVisualState): string {
  switch (state) {
    case "error":
      return `1.5px solid ${ERROR_COLOR}`;
    case "success":
      return `1.5px solid ${SUCCESS_COLOR}`;
    default:
      return `1.5px solid ${DEFAULT_BORDER}`;
  }
}

export function getInputStyle(
  state: FieldVisualState,
  primaryColor = "#4417E6",
): CSSProperties {
  const base: CSSProperties = {
    width: "100%",
    padding: "14px 48px 14px 16px",
    borderRadius: 14,
    border: getFieldBorder(state),
    fontSize: 15,
    color: "#1a1a1a",
    outline: "none",
    transition: "all 0.15s ease",
    boxSizing: "border-box",
  };

  if (state === "focus") {
    return {
      ...base,
      border: `1.5px solid ${primaryColor}`,
      boxShadow: `0 0 0 3px ${primaryColor}14`,
    };
  }

  return base;
}

type FieldErrorProps = {
  id?: string;
  message?: string;
};

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      style={{
        margin: "6px 0 0",
        fontSize: 12,
        color: ERROR_COLOR,
        lineHeight: 1.4,
        animation: "fadeIn 0.2s ease",
      }}
    >
      {message}
    </p>
  );
}

type ValidationSummaryProps = {
  errors: string[];
  title?: string;
};

export function ValidationSummary({
  errors,
  title = "Revisá los siguientes campos:",
}: ValidationSummaryProps) {
  const unique = [...new Set(errors)];
  if (unique.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: "#fff5f5",
        border: `1.5px solid ${ERROR_COLOR}33`,
        borderRadius: 14,
        padding: "12px 14px",
        marginBottom: 12,
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: ERROR_COLOR }}>
        {title}
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#6e6e73", lineHeight: 1.5 }}>
        {unique.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

type PasswordStrengthIndicatorProps = {
  strength: "empty" | "weak" | "medium" | "strong";
};

const STRENGTH_CONFIG = {
  empty: { label: "", color: "#e5e5ea", width: "0%" },
  weak: { label: "Débil", color: "#C52E3E", width: "33%" },
  medium: { label: "Media", color: "#FF9500", width: "66%" },
  strong: { label: "Fuerte", color: "#34C759", width: "100%" },
} as const;

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  if (strength === "empty") return null;
  const config = STRENGTH_CONFIG[strength];

  return (
    <div style={{ marginTop: 8 }} aria-live="polite">
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "#e5e5ea",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: config.width,
            background: config.color,
            borderRadius: 2,
            transition: "width 0.25s ease, background 0.25s ease",
          }}
        />
      </div>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: config.color, fontWeight: 600 }}>
        Contraseña {config.label.toLowerCase()}
      </p>
    </div>
  );
}

type SecuritySuccessBannerProps = {
  visible: boolean;
  message: string;
};

export function SecuritySuccessBanner({ visible, message }: SecuritySuccessBannerProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: "#f0fff4",
        border: "1.5px solid #34C75944",
        borderRadius: 14,
        padding: "12px 14px",
        marginTop: 8,
        fontSize: 13,
        color: "#1a7f37",
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
}

type CharCounterProps = {
  current: number;
  max: number;
};

export function CharCounter({ current, max }: CharCounterProps) {
  return (
    <span
      style={{
        fontSize: 12,
        color: current > max * 0.9 ? "#C52E3E" : "#9a9aa0",
        fontWeight: 500,
      }}
      aria-live="polite"
    >
      {current}/{max}
    </span>
  );
}

export function fieldAriaProps(field: string, hasError: boolean, errorId?: string) {
  return {
    "aria-invalid": hasError ? ("true" as const) : ("false" as const),
    "aria-describedby": hasError && errorId ? errorId : undefined,
    "data-testid": `register-field-${field}`,
  };
}

export type { ReactNode };
