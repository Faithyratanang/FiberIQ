const CACHE_NAME = "fiberiq-v1";

const APP_FILES = [
  "/FiberIQ/",
  "/FiberIQ/index.html",
  "/FiberIQ/manifest.json",
  "/FiberIQ/icon-192.png",
  "/FiberIQ/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request);
      })
      .catch(() => caches.match("/FiberIQ/"))
  );
});
