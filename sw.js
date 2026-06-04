const RH_CACHE_NAME='rh-services-v3.0.0-full-conversion';
const RH_ASSETS=['./','./index.html','./style.css','./app.js','./version.js','./manifest.webmanifest','./assets/rh-logo.png','./demos/aircond.html','./demos/renovation.html','./demos/plumbing.html'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(RH_CACHE_NAME).then(cache=>cache.addAll(RH_ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>key!==RH_CACHE_NAME?caches.delete(key):null))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(RH_CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));});
