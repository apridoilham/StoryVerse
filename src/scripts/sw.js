import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { matchPrecache } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === "style" || request.destination === "script" || request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: "assets-cache",
  })
);

registerRoute(
  ({ url }) => url.origin === "https://story-api.dicoding.dev" && url.pathname.startsWith("/v1/stories"),
  new NetworkFirst({
    cacheName: "stories-api-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.origin.includes("leaflet") || url.origin.includes("openstreetmap") || url.origin.includes("cloudflare") || url.origin.includes("cartocdn") || url.origin.includes("arcgisonline"),
  new CacheFirst({
    cacheName: "map-assets-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ]
  })
);

setCatchHandler(async ({ event }) => {
  if (event.request.mode === 'navigate') {
    return matchPrecache('offline.html');
  }
  return Response.error();
});


self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.options.body,
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-192x192.png',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const defaultUrl = '/index.html#/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      const focusedClient = windowClients.find(client => client.focused);
      if (focusedClient) {
        return focusedClient.navigate(defaultUrl).then(client => client.focus());
      }
      return clients.openWindow(defaultUrl);
    })
  );
});