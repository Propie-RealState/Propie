/**
 * Colores de cierre de registro por rol (dueño vs agente).
 * OWNER: #4417E6 / rgb(68, 23, 230) — AGENT: #C52E3E / rgb(197, 46, 62)
 */
export type RegisterCompletionVariant = "OWNER" | "AGENT";

export const REGISTER_COMPLETION = {
  OWNER: {
    rgb: "68, 23, 230" as const,
    primary: "#4417E6",
    primaryRgb: "rgb(68, 23, 230)",
    primaryHover: "#3510B8",
    /** Overlay / celebración (misma familia que el hero dueño) */
    gradient:
      "linear-gradient(155deg, #5A32F0 0%, #4417E6 45%, #3510B8 100%)",
    ring: "rgba(255,255,255,0.35)",
    checkGlow: "rgba(255,255,255,0.45)",
    buttonShadow: "0 4px 18px rgba(68, 23, 230, 0.35)",
    buttonShadowHover: "0 8px 24px rgba(68, 23, 230, 0.42)",
  },
  AGENT: {
    rgb: "197, 46, 62" as const,
    primary: "#C52E3E",
    primaryRgb: "rgb(197, 46, 62)",
    primaryHover: "#A82534",
    gradient:
      "linear-gradient(155deg, #FF8C5B 0%, #C52E3E 45%, #A82534 100%)",
    ring: "rgba(255,255,255,0.4)",
    checkGlow: "rgba(255,255,255,0.5)",
    buttonShadow: "0 4px 18px rgba(197, 46, 62, 0.35)",
    buttonShadowHover: "0 8px 24px rgba(197, 46, 62, 0.42)",
  },
} as const;
