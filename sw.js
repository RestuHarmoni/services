const RH_CACHE_NAME = 'services-restu-harmoni-v6.1.0';
const RH_ASSETS = [
  './', './index.html', './style.css', './app.js', './version.js', './manifest.webmanifest',
  './supabase-config.js', './aira-lead-system.js', './admin-login.html', './admin.html', './admin.js', './admin-auth.js', './admin-leads.html', './admin-blog.js', './blog.html', './article.html',
  './template-demo.css', './template-demo.js', './content/templates-data.json', './assets/rh-logo.png', './assets/aira-avatar.svg', './assets/default-avatar.svg',
  './templates/aircond.html', './templates/renovation.html', './templates/kedai-makan.html', './templates/butik.html', './templates/homestay.html', './templates/kereta-sewa.html', './templates/corporate.html', './templates/produk-online.html'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(RH_CACHE_NAME).then(cache => cache.addAll(RH_ASSETS.map(u => new Request(u, {cache:'reload'}))).catch(() => Promise.resolve())));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== RH_CACHE_NAME ? caches.delete(key) : null))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(RH_CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
