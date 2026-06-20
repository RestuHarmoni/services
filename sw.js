const RH_VERSION = 'v1-admin-level2-notifications-hotfix2-20260620';
const RH_CACHE_NAME = `services-restu-harmoni-${RH_VERSION}`;
const RH_CRITICAL_EXTENSIONS = ['.html', '.js', '.css', '.json', '.webmanifest'];
const RH_NETWORK_FIRST_PATHS = ['/content/', '/engine/'];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_RH_CACHE') {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))));
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => {
        if (key !== RH_CACHE_NAME) return caches.delete(key);
      })))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => clients.forEach(client => client.postMessage({ type: 'RH_SW_UPDATED', version: RH_VERSION })))
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
    RH_CRITICAL_EXTENSIONS.some(ext => pathname.endsWith(ext)) ||
    RH_NETWORK_FIRST_PATHS.some(path => pathname.includes(path));

  if (isCriticalFile) {
    event.respondWith(
      fetch(new Request(event.request, { cache: 'no-store' }))
        .then(response => {
          const copy = response.clone();
          if (response && response.ok) caches.open(RH_CACHE_NAME).then(cache => cache.put(event.request, copy));
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
        if (response && response.ok) caches.open(RH_CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// project-full-v1


self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { title: 'Lead Baru', body: event.data ? event.data.text() : '' }; }
  const title = payload.title || '🔔 Lead Baru Masuk';
  const options = {
    body: payload.body || 'Ada lead baru dalam RH Services Dashboard.',
    icon: payload.icon || '/assets/rh-logo.png',
    badge: payload.badge || '/assets/rh-logo.png',
    tag: payload.tag || 'rh-new-lead',
    data: payload.data || { url: '/admin/leads.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin/leads.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ('focus' in client && client.url.includes('/admin/')) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
