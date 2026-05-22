export type AppTheme = {
  primary: string;
  primaryDark: string;
  primaryHover: string;
  heroGradient: string;
  lightBg: string;
  lightBgSolid: string;
  focusShadow: string;
  buttonShadow: string;
  buttonHoverShadow: string;
  saleBadge: string;
  rgb: string;
};

export const PROPIE_THEME: AppTheme = {
  primary: "#4417E6",
  primaryDark: "#3510B8",
  primaryHover: "#3510B8",
  heroGradient:
    "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
  lightBg: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
  lightBgSolid: "#f0eeff",
  focusShadow: "0 0 0 3px rgba(68,23,230,0.08)",
  buttonShadow: "0 4px 16px rgba(68,23,230,0.24)",
  buttonHoverShadow: "0 6px 20px rgba(68,23,230,0.32)",
  saleBadge: "#4f46e5",
  rgb: "68, 23, 230",
};

export const AGENT_THEME: AppTheme = {
  primary: "#C52E3E",
  primaryDark: "#A82534",
  primaryHover: "#A82534",
  heroGradient:
    "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)",
  lightBg: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)",
  lightBgSolid: "#fff4ed",
  focusShadow: "0 0 0 3px rgba(197,46,62,0.08)",
  buttonShadow: "0 4px 16px rgba(197,46,62,0.24)",
  buttonHoverShadow: "0 6px 20px rgba(197,46,62,0.32)",
  saleBadge: "#C52E3E",
  rgb: "197, 46, 62",
};

export function getAppTheme(isAgent: boolean): AppTheme {
  return isAgent ? AGENT_THEME : PROPIE_THEME;
}

export function syncUserTypeFromRole(role: string | undefined | null) {
  if (role === "AGENT") {
    sessionStorage.setItem("userType", "agente");
    return;
  }

  if (role === "OWNER") {
    sessionStorage.setItem("userType", "propie");
  }
}

export function isAgentRole(role: string | undefined | null): boolean {
  return role === "AGENT" || sessionStorage.getItem("userType") === "agente";
}
