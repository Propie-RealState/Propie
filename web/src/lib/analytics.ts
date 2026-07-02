import type { PostHog } from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

// posthog-js is loaded lazily so it never blocks React startup and stays out of
// the initial bundle (it lands in its own async "posthog" chunk).
let instance: PostHog | null = null;
let initStarted = false;

export async function initAnalytics(): Promise<void> {
  if (initStarted) return;
  if (!POSTHOG_KEY) return;
  initStarted = true;

  const { default: posthog } = await import("posthog-js");

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: false,
    persistence: "localStorage+cookie",
    disable_session_recording: import.meta.env.DEV,
  });

  instance = posthog;
}

export function identifyUser(userId: string, properties: Record<string, unknown>) {
  instance?.identify(userId, properties);
}

export function resetUser() {
  instance?.reset();
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  instance?.capture(event, properties);
}
