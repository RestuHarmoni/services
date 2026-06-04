const RH_CACHE_NAME = "rh-services-v2.1.1";
const RH_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./version.js",
  "./assets/rh-logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(RH_CACHE_NAME).then(cache => cache.addAll(RH_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== RH_CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(RH_CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
