import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  if (!POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: false,
    persistence: "localStorage+cookie",
    disable_session_recording: import.meta.env.DEV,
  });

  initialized = true;
}

export function identifyUser(userId: string, properties: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (!initialized) return;
  posthog.reset();
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export { posthog };
