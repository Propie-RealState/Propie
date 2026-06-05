export type PushSubscriptionPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  platform?: string;
};

export type PushVapidConfig = {
  publicKey: string;
  enabled: boolean;
};

export const PUSH_ENGAGEMENT_EVENT = "push:engagement";
export const PUSH_SUBSCRIPTION_CHANGED_EVENT = "push:subscription-changed";

const PUSH_PROMPT_SHOWN_KEY = "propie_push_prompt_shown";
const PUSH_STATUS_KEY = "propie_push_status";

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function hasPushPromptShown() {
  return localStorage.getItem(PUSH_PROMPT_SHOWN_KEY) === "1";
}

export function markPushPromptShown() {
  localStorage.setItem(PUSH_PROMPT_SHOWN_KEY, "1");
}

export function getStoredPushStatus():
  | "granted"
  | "denied"
  | "skipped"
  | null {
  const value = localStorage.getItem(PUSH_STATUS_KEY);

  if (value === "granted" || value === "denied" || value === "skipped") {
    return value;
  }

  return null;
}

export function setStoredPushStatus(
  status: "granted" | "denied" | "skipped",
) {
  localStorage.setItem(PUSH_STATUS_KEY, status);
}

export function emitPushEngagement() {
  window.dispatchEvent(new Event(PUSH_ENGAGEMENT_EVENT));
}

export function detectPushPlatform() {
  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }

  if (/android/.test(ua)) {
    return "android";
  }

  return "desktop";
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function encodeSubscriptionKey(key: ArrayBuffer | null) {
  if (!key) {
    throw new Error("PUSH_SUBSCRIPTION_KEY_MISSING");
  }

  return window
    .btoa(String.fromCharCode(...new Uint8Array(key)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getServiceWorkerRegistration() {
  if (!isPushSupported()) {
    return null;
  }

  return navigator.serviceWorker.ready;
}

export async function getExistingPushSubscription() {
  const registration = await getServiceWorkerRegistration();

  if (!registration) {
    return null;
  }

  return registration.pushManager.getSubscription();
}

export async function subscribeToPushNotifications(
  publicKey: string,
): Promise<PushSubscriptionPayload> {
  const registration = await getServiceWorkerRegistration();

  if (!registration) {
    throw new Error("PUSH_UNSUPPORTED");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("PUSH_PERMISSION_DENIED");
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("PUSH_SUBSCRIPTION_INVALID");
  }

  return {
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    platform: detectPushPlatform(),
  };
}

export async function unsubscribeFromPushNotifications() {
  const subscription = await getExistingPushSubscription();

  if (!subscription) {
    return null;
  }

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}

export function subscriptionToPayload(
  subscription: PushSubscription,
): PushSubscriptionPayload {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("PUSH_SUBSCRIPTION_INVALID");
  }

  return {
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    platform: detectPushPlatform(),
  };
}

export { encodeSubscriptionKey };
