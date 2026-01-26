const CACHE_NAME = "verbs-pwa-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./app.js",
  "./verbs.json",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        })
      );
    }).catch(() => {
      // fallback if everything fails
      return caches.match("./index.html");
    })
  );
});
