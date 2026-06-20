const RH_CACHE='rh-services-admin-v1';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{});
self.addEventListener('push',event=>{
  let data={};
  try{ data=event.data ? event.data.json() : {}; }catch{ data={body:event.data ? event.data.text() : ''}; }
  const title=data.title || '🚨 Lead Belum Jadi Prospek';
  const options={
    body:data.body || 'Ada lead baru/belum jadi prospek. Sila semak dashboard.',
    icon:data.icon || '/assets/rh-logo.png',
    badge:data.badge || '/assets/rh-logo.png',
    tag:data.tag || ('rh-lead-'+(data.lead_id||Date.now())),
    renotify:true,
    requireInteraction:true,
    data:{url:data.url || '/admin/leads.html', lead_id:data.lead_id || null}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=event.notification?.data?.url || '/admin/leads.html';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){ if(client.url.includes('/admin/')){ client.focus(); client.navigate(url); return; } }
    return clients.openWindow(url);
  }));
});
