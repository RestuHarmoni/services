const RH_VERSION = 'v1-admin-project-module-v1.2-department-production-engine';
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

// RH Lead Phone Push v1
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'RH Lead Alert', body: event.data ? event.data.text() : 'Lead baru masuk.' }; }
  const title = data.title || '🚀 RH Lead Alert';
  const options = {
    body: data.body || 'Lead baru menunggu tindakan.',
    icon: data.icon || '/assets/rh-logo.png',
    badge: data.badge || '/assets/rh-logo.png',
    tag: data.tag || ('rh-lead-' + (data.lead_id || Date.now())),
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || '/admin/leads.html', lead_id: data.lead_id || null }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/admin/leads.html';
  event.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
    for (const client of list) {
      if ('focus' in client) { client.navigate(url); return client.focus(); }
    }
    return clients.openWindow(url);
  }));
});
