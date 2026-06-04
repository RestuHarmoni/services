const RH_CACHE_NAME = 'services-restu-harmoni-v3.6.0';
const RH_ASSETS=['./','./index.html',
  './templates/produk-online.html',
  './templates/corporate.html',
  './templates/kereta-sewa.html',
  './templates/homestay.html',
  './templates/butik.html',
  './templates/kedai-makan.html',
  './templates/renovation.html',
  './templates/aircond.html',
  './demo-generator.html','./style.css','./app.js','./version.js','./manifest.webmanifest','./assets/rh-logo.png','./demos/aircond.html','./demos/renovation.html','./demos/plumbing.html'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(RH_CACHE_NAME).then(cache=>cache.addAll(RH_ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>key!==RH_CACHE_NAME?caches.delete(key):null))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(RH_CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));});

/* RH_V3_2_FILES
./demo-generator.html
./templates/aircond.html
./templates/renovation.html
./templates/kedai-makan.html
./templates/butik.html
./templates/homestay.html
./templates/kereta-sewa.html
./templates/corporate.html
./templates/produk-online.html
*/

/* RH_V3_3_FILES
./demo-generator.html
./templates/aircond.html
./templates/renovation.html
./templates/kedai-makan.html
./templates/butik.html
./templates/homestay.html
./templates/kereta-sewa.html
./templates/corporate.html
./templates/produk-online.html
*/

/* RH_V3_4_FILES
./assets/aira-avatar.webp
./assets/aira-avatar.svg
./assets/default-avatar.svg
*/

/* RH_V3_5_AIRA_LIVELY: CSS breathing avatar, online pulse, typing movement */

/* RH_V3_6_PROMO_SCROLLFIX: removed old WA float, promo 42h countdown, Aira scroll lock */
