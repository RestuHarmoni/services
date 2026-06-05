const RH_CACHE_NAME = 'services-restu-harmoni-v5.2.6';
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

/* 
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

/* 
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

/* 
./assets/aira-avatar.webp
./assets/aira-avatar.svg
./assets/default-avatar.svg
*/

/* */

/* */



/* RH_V4_0_PRODUCTION_REFINED */

/* RH_V4_0_1_AIRA_HOTFIX */

/* RH_V4_1_ADMIN_TEMPLATES: admin-login.html admin.html admin.js content/*.json template-demo.css template-demo.js */

/* RH_V4_2_UNIFIED_DEMO_UI */

/* RH_V4_3_SHOWCASE_POSITION */

/* RH_V4_4_DEMO_SLIDER_CLEAN */

/* AIRA_LEAD_FUNNEL_V52 */

/* RH_V5_2_1_SUPABASE_LEADS */

/* RH_V5_2_4_ADMIN_LEADS_LINKED */

/* RH_V5_2_5_AIRA_POPUP_ONLY */

/* RH_V5_2_6_AIRA_SINGLE_POPUP_SUPABASE */
