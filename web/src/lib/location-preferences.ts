import { updateNotificationPreferences } from "../app/modules/notifications/services/notifications.service";

export type GeoPermissionState = "granted" | "prompt" | "denied" | "unsupported";

export type GeoCoordinates = {
  lat: number;
  lng: number;
};

export type SyncLocationResult =
  | { status: "persisted"; coordinates: GeoCoordinates }
  | { status: "prompt_needed" }
  | { status: "denied" }
  | { status: "skipped" }
  | { status: "unsupported" }
  | { status: "not_authenticated" }
  | { status: "error" };

export const AUTH_SESSION_READY_EVENT = "auth:session-ready";
const GEO_PROMPT_SHOWN_KEY = "propie_geo_prompt_shown";
const GEO_STATUS_KEY = "propie_geo_status";
const GEO_BANNER_DISMISSED_KEY = "propie_geo_banner_dismissed";

let syncInFlight: Promise<SyncLocationResult> | null = null;

export function hasAccessToken() {
  return Boolean(localStorage.getItem("accessToken"));
}

export function markGeoPromptShown() {
  localStorage.setItem(GEO_PROMPT_SHOWN_KEY, "1");
}

export function hasGeoPromptShown() {
  return localStorage.getItem(GEO_PROMPT_SHOWN_KEY) === "1";
}

export function getStoredGeoStatus():
  | "granted"
  | "denied"
  | "skipped"
  | null {
  const value = localStorage.getItem(GEO_STATUS_KEY);
  if (value === "granted" || value === "denied" || value === "skipped") {
    return value;
  }
  return null;
}

export function setStoredGeoStatus(
  status: "granted" | "denied" | "skipped",
) {
  localStorage.setItem(GEO_STATUS_KEY, status);
}

export function dismissGeoBannerForSession() {
  sessionStorage.setItem(GEO_BANNER_DISMISSED_KEY, "1");
}

export function isGeoBannerDismissedForSession() {
  return sessionStorage.getItem(GEO_BANNER_DISMISSED_KEY) === "1";
}

export async function getGeolocationPermissionState(): Promise<GeoPermissionState> {
  if (!navigator.geolocation) {
    return "unsupported";
  }

  if (!navigator.permissions?.query) {
    return "prompt";
  }

  try {
    const result = await navigator.permissions.query({
      name: "geolocation",
    });

    if (
      result.state === "granted" ||
      result.state === "prompt" ||
      result.state === "denied"
    ) {
      return result.state;
    }
  } catch {
    // Permissions API may fail on some browsers.
  }

  return "prompt";
}

export function getCurrentCoordinates(input?: {
  maximumAge?: number;
  timeout?: number;
}): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GEOLOCATION_UNSUPPORTED"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: input?.timeout ?? 7000,
        maximumAge: input?.maximumAge ?? 1000 * 60 * 15,
      },
    );
  });
}

export async function persistNotificationLocation(
  coordinates: GeoCoordinates,
) {
  if (!hasAccessToken()) {
    return null;
  }

  const preferences = await updateNotificationPreferences({
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    nearbyEnabled: true,
  });

  setStoredGeoStatus("granted");
  window.dispatchEvent(new Event("location-preferences:changed"));

  return preferences;
}

export async function requestAndPersistLocation(): Promise<SyncLocationResult> {
  if (!hasAccessToken()) {
    return { status: "not_authenticated" };
  }

  if (!navigator.geolocation) {
    return { status: "unsupported" };
  }

  try {
    const coordinates = await getCurrentCoordinates({
      maximumAge: 0,
    });
    await persistNotificationLocation(coordinates);
    return { status: "persisted", coordinates };
  } catch {
    const permission = await getGeolocationPermissionState();

    if (permission === "denied") {
      setStoredGeoStatus("denied");
      return { status: "denied" };
    }

    return { status: "error" };
  }
}

export async function syncNotificationLocationOnAuth(): Promise<SyncLocationResult> {
  if (!hasAccessToken()) {
    return { status: "not_authenticated" };
  }

  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    const permission = await getGeolocationPermissionState();

    if (permission === "unsupported") {
      return { status: "unsupported" };
    }

    // First authenticated session: always show our explainer first,
    // even if the browser already granted geolocation (e.g. from /mapa).
    if (!hasGeoPromptShown()) {
      return { status: "prompt_needed" };
    }

    if (permission === "granted") {
      try {
        const coordinates = await getCurrentCoordinates({
          maximumAge: 1000 * 60 * 15,
        });
        await persistNotificationLocation(coordinates);
        return { status: "persisted", coordinates };
      } catch {
        return { status: "error" };
      }
    }

    if (permission === "denied") {
      setStoredGeoStatus("denied");
      return { status: "denied" };
    }

    return { status: "skipped" };
  })();

  try {
    return await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}

export function shouldShowGeoBanner(result: SyncLocationResult) {
  if (result.status === "denied" || result.status === "skipped") {
    return !isGeoBannerDismissedForSession();
  }

  return false;
}
