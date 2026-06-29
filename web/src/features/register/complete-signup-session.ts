import { apiFetch } from "../../lib/api";
import type { RegisterRole } from "../../context/RegisterContext";
import { getPendingAvatarFile, clearPendingAvatarFile } from "../../lib/pending-avatar";
import { uploadAvatar } from "../../app/modules/profile/services/upload-avatar.service";
import { trackEvent } from "../../lib/analytics";
import { AnalyticsEvents } from "../../lib/analytics-events";

type AuthUser = {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

type AuthSession = {
  login: (
    accessToken: string,
    refreshToken: string,
    user: AuthUser,
  ) => void;
};

export async function completeSignupSession(
  auth: AuthSession,
  data: {
    email: string;
    password: string;
    role: RegisterRole | null;
  },
): Promise<void> {
  const loginResponse = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  const authData = loginResponse?.data;

  if (
    !authData?.accessToken ||
    !authData?.refreshToken ||
    !authData?.user
  ) {
    throw new Error("INVALID_LOGIN_RESPONSE");
  }

  trackEvent(AnalyticsEvents.AUTH_LOGIN, { role: authData.user.role });

  auth.login(
    authData.accessToken,
    authData.refreshToken,
    authData.user,
  );

  if (data.role === "AGENT") {
    sessionStorage.setItem("userType", "agente");
  } else if (data.role === "OWNER") {
    sessionStorage.setItem("userType", "propie");
  } else {
    sessionStorage.removeItem("userType");
  }

  const pendingAvatar = getPendingAvatarFile();
  if (pendingAvatar) {
    try {
      await uploadAvatar(pendingAvatar);
    } catch {
      // Non-fatal: avatar upload failure should not block registration completion.
    } finally {
      clearPendingAvatarFile();
    }
  }
}
