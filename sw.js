const CACHE_NAME = "fiberiq-v2";

const APP_FILES = [
  "/FiberIQ/",
  "/FiberIQ/index.html",
  "/FiberIQ/manifest.json",

  // App icons
  "/FiberIQ/icon-192.png",
  "/FiberIQ/icon-512.png",

  // Screenshots
  "/FiberIQ/screenshots/dashboard.PNG",
  "/FiberIQ/screenshots/fault-locator.PNG",
  "/FiberIQ/screenshots/dashboard-mobile.png",
  "/FiberIQ/screenshots/fault-locator-mobile.png"
];


// ================================
// INSTALL
// ================================

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => {

        console.log("FiberIQ: caching application files");

        return cache.addAll(APP_FILES);

      })

      .then(() => {

        console.log("FiberIQ: installation complete");

        return self.skipWaiting();

      })

  );

});


// ================================
// ACTIVATE
// ================================

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()

      .then(cacheNames => {

        return Promise.all(

          cacheNames

            .filter(cacheName => cacheName !== CACHE_NAME)

            .map(cacheName => {

              console.log(
                "FiberIQ: deleting old cache:",
                cacheName
              );

              return caches.delete(cacheName);

            })

        );

      })

      .then(() => {

        console.log("FiberIQ: service worker activated");

        return self.clients.claim();

      })

  );

});


// ================================
// FETCH
// ================================

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    caches.match(event.request)

      .then(cachedResponse => {

        // Use cached version if available
        if (cachedResponse) {

          return cachedResponse;

        }

        // Otherwise fetch from network
        return fetch(event.request)

          .then(networkResponse => {

            // Only cache successful responses
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === "opaque"
            ) {

              return networkResponse;

            }

            const responseClone =
              networkResponse.clone();

            caches.open(CACHE_NAME)

              .then(cache => {

                cache.put(
                  event.request,
                  responseClone
                );

              });

            return networkResponse;

          });

      })

      .catch(() => {

        // Offline fallback
        return caches.match("/FiberIQ/");

      })

  );

});
