import { API_URL } from "./api-base";
import { clearMediaToken } from "./media/media-token";

export async function apiFetch(
  path: string,
  options?: RequestInit,
  _retry = false,
) {
  const shouldRefreshSession =
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register") &&
    !path.startsWith("/auth/refresh") &&
    !path.startsWith("/auth/verify-email") &&
    !path.startsWith("/auth/verification/resend");

  // ====================================================
  // ACCESS TOKEN
  // ====================================================

  const accessToken = localStorage.getItem("accessToken");

  // ====================================================
  // REQUEST
  // ====================================================

  const response = await fetch(`${API_URL}${path}`, {
    ...options,

    headers: {
      ...(options?.body && {
        "Content-Type": "application/json",
      }),

      Authorization: accessToken ? `Bearer ${accessToken}` : "",

      ...options?.headers,
    },
  });

  // ====================================================
  // PARSE RESPONSE
  // ====================================================

  const text = await response.text();
  const data = text.length > 0 ? JSON.parse(text) : null;

  // ====================================================
  // GLOBAL 401 DETECTION
  // ====================================================

  if (
    response.status === 401 &&
    shouldRefreshSession &&
    !_retry
  ) {
    console.warn("Access token expired. Refreshing session...");

    try {
      // ================================================
      // REFRESH TOKEN
      // ================================================

      const refreshToken = localStorage.getItem("refreshToken");

      // ================================================
      // NO REFRESH TOKEN
      // ================================================

      if (!refreshToken) {
        throw new Error("NO_REFRESH_TOKEN");
      }

      // ================================================
      // REFRESH REQUEST
      // ================================================

      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          refreshToken,
        }),
      });

      const refreshData = await refreshResponse.json();

      // ================================================
      // REFRESH FAILED
      // ================================================

      if (!refreshResponse.ok) {
        throw refreshData;
      }

      // ================================================
      // SAVE NEW TOKENS
      // ================================================

      localStorage.setItem("accessToken", refreshData.data.accessToken);

      localStorage.setItem("refreshToken", refreshData.data.refreshToken);

      // ================================================
      // RETRY ORIGINAL REQUEST
      // ================================================

      return apiFetch(path, options, true);
    } catch (error) {
      console.error("Refresh session failed", error);

      // ================================================
      // CLEANUP SESSION
      // ================================================

      localStorage.removeItem("accessToken");

      localStorage.removeItem("refreshToken");
      clearMediaToken();

      window.location.href = "/explorar";

      throw error;
    }
  }

  // ====================================================
  // OTHER ERRORS
  // ====================================================

  if (!response.ok) {
    throw data;
  }

  // ====================================================
  // SUCCESS
  // ====================================================

  return data;
}

/**
 * Multipart upload with the same session refresh behaviour as apiFetch.
 * Does not set Content-Type — the browser sets the multipart boundary.
 */
export async function uploadMultipart(
  path: string,
  formData: FormData,
  _retry = false,
): Promise<unknown> {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  });

  const text = await response.text();
  const data = text.length > 0 ? JSON.parse(text) : null;

  if (response.status === 401 && !_retry && accessToken) {
    console.warn("Access token expired. Refreshing session...");

    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("NO_REFRESH_TOKEN");
      }

      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok) {
        throw refreshData;
      }

      localStorage.setItem("accessToken", refreshData.data.accessToken);
      localStorage.setItem("refreshToken", refreshData.data.refreshToken);

      return uploadMultipart(path, formData, true);
    } catch (error) {
      console.error("Refresh session failed", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      clearMediaToken();
      window.location.href = "/explorar";
      throw error;
    }
  }

  if (!response.ok) {
    throw data;
  }

  return data;
}
