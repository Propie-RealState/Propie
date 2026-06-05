/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

type PushPayload = {
  title?: string;
  body?: string;
  url?: string;
  notificationId?: string;
  type?: string;
  entityType?: string | null;
  entityId?: string | null;
};

self.addEventListener("push", (event) => {
  const payload = (() => {
    try {
      return (event.data?.json() ?? {}) as PushPayload;
    } catch {
      return {
        title: event.data?.text() ?? "Propie",
      } satisfies PushPayload;
    }
  })();

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Propie", {
      body: payload.body ?? "",
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      tag: payload.notificationId ?? payload.type ?? "propie-notification",
      data: {
        url: payload.url ?? "/notificaciones",
        notificationId: payload.notificationId ?? null,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    typeof event.notification.data?.url === "string"
      ? event.notification.data.url
      : "/notificaciones";

  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            client.navigate(absoluteUrl);
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(absoluteUrl);
        }

        return undefined;
      }),
  );
});
