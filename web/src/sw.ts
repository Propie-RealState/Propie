/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Lazy-loaded route chunks, their CSS and local images are intentionally kept
// out of the precache manifest (see vite.config injectManifest). Cache them on
// first use so previously visited routes keep working offline, without bloating
// the install-time precache with heavy optional code (maplibre, recharts, …).
registerRoute(
  ({ request, sameOrigin }) =>
    sameOrigin &&
    (request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "image"),
  new StaleWhileRevalidate({
    cacheName: "app-assets",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

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
