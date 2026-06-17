export type AgentExperienceEntry = {
  position: string;
  company: string;
  years: string;
};

export type AgentCertificationEntry = {
  name: string;
  issuer: string;
  year: string;
};

export type AgentEducationEntry = {
  institution: string;
  degree: string;
  year: string;
};

export type AgentProfessionalProfile = {
  experience: AgentExperienceEntry[];
  certifications: AgentCertificationEntry[];
  education: AgentEducationEntry[];
};

export type AgentCompletionItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type AgentCompletionSummary = {
  percentage: number;
  items: AgentCompletionItem[];
  missingProfessional: boolean;
};

const EMPTY_ENTRY = {
  experience: { position: "", company: "", years: "" },
  certification: { name: "", issuer: "", year: "" },
  education: { institution: "", degree: "", year: "" },
};

export function parseAgentJsonArray<T>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value as T[];
}

export function hasExperienceEntry(entries: AgentExperienceEntry[]): boolean {
  return entries.some((e) => e.position.trim() || e.company.trim() || e.years.trim());
}

export function hasCertificationEntry(entries: AgentCertificationEntry[]): boolean {
  return entries.some((e) => e.name.trim() || e.issuer.trim() || e.year.trim());
}

export function hasEducationEntry(entries: AgentEducationEntry[]): boolean {
  return entries.some((e) => e.institution.trim() || e.degree.trim() || e.year.trim());
}

export function getAgentProfessionalProfile(profile?: {
  avatar_url?: string | null;
  bio?: string | null;
  experience?: unknown;
  certifications?: unknown;
  education?: unknown;
}): AgentProfessionalProfile {
  return {
    experience: parseAgentJsonArray<AgentExperienceEntry>(profile?.experience),
    certifications: parseAgentJsonArray<AgentCertificationEntry>(profile?.certifications),
    education: parseAgentJsonArray<AgentEducationEntry>(profile?.education),
  };
}

export function getAgentCompletionSummary(profile?: {
  avatar_url?: string | null;
  bio?: string | null;
  experience?: unknown;
  certifications?: unknown;
  education?: unknown;
}): AgentCompletionSummary {
  const professional = getAgentProfessionalProfile(profile);
  const items: AgentCompletionItem[] = [
    {
      id: "photo",
      label: "Foto",
      completed: Boolean(profile?.avatar_url),
    },
    {
      id: "bio",
      label: "Bio",
      completed: Boolean(profile?.bio?.trim()),
    },
    {
      id: "experience",
      label: "Experiencia",
      completed: hasExperienceEntry(professional.experience),
    },
    {
      id: "certifications",
      label: "Certificaciones",
      completed: hasCertificationEntry(professional.certifications),
    },
    {
      id: "education",
      label: "Educación",
      completed: hasEducationEntry(professional.education),
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);
  const missingProfessional =
    !hasExperienceEntry(professional.experience) ||
    !hasCertificationEntry(professional.certifications) ||
    !hasEducationEntry(professional.education);

  return { percentage, items, missingProfessional };
}

const LEGACY_BANNER_DISMISS_KEY = "propie.agent_profile_banner_dismiss";
const BANNER_SNOOZE_KEY_PREFIX = "propie.agent_profile_banner_snooze:";

function bannerSnoozeKey(userId: string) {
  return `${BANNER_SNOOZE_KEY_PREFIX}${userId}`;
}

/** Hide banner for the rest of this browser session (until next login). */
export function snoozeAgentBannerForSession(userId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(bannerSnoozeKey(userId), "1");
}

export function isAgentBannerSnoozedForSession(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(bannerSnoozeKey(userId)) === "1";
}

export function clearAgentBannerSnoozeForSession(userId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(bannerSnoozeKey(userId));
}

/** Remove old browser-global dismiss flag (pre–per-account storage). */
export function clearLegacyBannerDismissStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_BANNER_DISMISS_KEY);
}

/** True when the old global localStorage flag was set to permanent dismiss. */
export function hadLegacyPermanentBannerDismiss(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LEGACY_BANNER_DISMISS_KEY) === "never";
}

export function shouldShowAgentBanner(
  user:
    | {
        id: string;
        role: string;
        profile?: { agent_profile_banner_dismissed?: boolean };
      }
    | null
    | undefined,
  summary: AgentCompletionSummary,
): boolean {
  if (!user || user.role !== "AGENT") return false;
  if (!summary.missingProfessional) return false;
  if (user.profile?.agent_profile_banner_dismissed) return false;
  if (isAgentBannerSnoozedForSession(user.id)) return false;
  return true;
}

export { EMPTY_ENTRY };
