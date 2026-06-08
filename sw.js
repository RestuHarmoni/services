const RH_VERSION = '6.3.0-supabase-aira';
const RH_CACHE_NAME = `services-restu-harmoni-${RH_VERSION}`;
const RH_CRITICAL_EXTENSIONS = ['.html', '.js', '.css', '.json', '.webmanifest'];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => {
        if (key !== RH_CACHE_NAME) return caches.delete(key);
      })))
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
    pathname.endsWith('/') ||
    RH_CRITICAL_EXTENSIONS.some(ext => pathname.endsWith(ext));

  if (isCriticalFile) {
    event.respondWith(
      fetch(new Request(event.request, { cache: 'reload' }))
        .then(response => {
          const copy = response.clone();
          caches.open(RH_CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(RH_CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
