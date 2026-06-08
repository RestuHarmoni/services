const RH_CACHE_NAME = 'services-restu-harmoni-v6.1.7-aira-intake-detail';
const RH_VERSION = '6.1.7';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const pathname = url.pathname;
  const isCriticalFile =
    pathname === '/' ||
    pathname.endsWith('.html') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.webmanifest');

  if (isCriticalFile) {
    event.respondWith(
      fetch(new Request(event.request, { cache: 'no-store' }))
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(RH_CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
