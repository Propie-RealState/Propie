import { apiFetch } from "../../../../lib/api";
import type {
  AgentCertificationEntry,
  AgentEducationEntry,
  AgentExperienceEntry,
} from "../../../../lib/agent-profile-completion";

export async function updateMyProfile(data: {
  phone?: string;
  location?: string;
  bio?: string;
  first_name?: string;
  last_name?: string;
  nationality?: string;
  birth_date?: string;
  experience?: AgentExperienceEntry[];
  certifications?: AgentCertificationEntry[];
  education?: AgentEducationEntry[];
  agent_profile_banner_dismissed?: boolean;
}) {
  return apiFetch("/profile/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function dismissAgentProfileBanner() {
  return updateMyProfile({ agent_profile_banner_dismissed: true });
}
