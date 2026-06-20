/* RH Lead Phone Push v1 - PWA Web Push without Telegram */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const cfg = () => window.RH_PUSH_CONFIG || {};
  const APP_ROOT = location.origin;
  const STATUS_STOP = ['converted','prospect','qualified_prospect','archived','closed','lost','deleted'];
  let client = null;
  let realtimeChannel = null;
  let lastSeenLeadAt = localStorage.getItem('rh_last_seen_lead_at') || '';

  function esc(s){return String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function activeLead(lead){ return !STATUS_STOP.includes(String(lead?.status||'new').toLowerCase()); }
  function setPushStatus(text, type='info'){
    const el = $('#rhPushStatus');
    if(el){ el.textContent = text; el.dataset.type = type; }
  }
  async function getClient(){
    if(client) return client;
    if(typeof window.RHGetSupabaseClient !== 'function') return null;
    client = await window.RHGetSupabaseClient({throwOnMissing:false});
    return client;
  }
  function urlBase64ToUint8Array(base64String){
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }
  async function registerServiceWorker(){
    if(!('serviceWorker' in navigator)) throw new Error('Browser ini tidak menyokong Service Worker.');
    const reg = await navigator.serviceWorker.register('/sw.js', {scope:'/'});
    await navigator.serviceWorker.ready;
    return reg;
  }
  async function showLocalNotification(title, options){
    if(!('Notification' in window)) return false;
    if(Notification.permission !== 'granted') return false;
    const reg = await registerServiceWorker();
    if(reg && reg.showNotification){
      await reg.showNotification(title, options || {});
      return true;
    }
    new Notification(title, options || {});
    return true;
  }
  function showDashboardPopup(lead, reminder=false){
    let wrap = $('#rhLeadPushPopupWrap');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'rhLeadPushPopupWrap';
      document.body.appendChild(wrap);
    }
    const card = document.createElement('div');
    card.className = 'rh-lead-push-popup';
    card.innerHTML = `<button class="rh-lead-popup-close" aria-label="Tutup">×</button>
      <div class="rh-lead-popup-icon">🔔</div>
      <div class="rh-lead-popup-body">
        <strong>${reminder?'Lead belum jadi Prospect':'Lead Baru Masuk'}</strong>
        <span>${esc(lead.name||'Tanpa nama')} • ${esc(lead.phone||'-')}</span>
        <small>${esc(lead.business_type||lead.objective||'Klik untuk buka Leads')}</small>
      </div>
      <a class="rh-lead-popup-action" href="/admin/leads.html">Buka</a>`;
    card.querySelector('.rh-lead-popup-close').onclick = () => card.remove();
    wrap.prepend(card);
    setTimeout(()=>card.remove(), 22000);
  }
  async function notifyLead(lead, reminder=false){
    if(!activeLead(lead)) return;
    showDashboardPopup(lead, reminder);
    const title = reminder ? '🔔 Lead belum masuk Prospect' : '🚀 Lead Baru Masuk';
    const body = `${lead.name || 'Tanpa nama'} • ${lead.phone || '-'}\n${lead.business_type || lead.objective || 'Sila follow up sekarang'}`;
    try{ await showLocalNotification(title, {body, icon:'/assets/rh-logo.png', badge:'/assets/rh-logo.png', tag:`rh-lead-${lead.id}`, renotify:true, requireInteraction:true, data:{url:'/admin/leads.html', lead_id:lead.id}}); }catch(e){}
  }
  async function enablePush(){
    try{
      setPushStatus('Mendaftar PWA push...', 'info');
      const publicKey = String(cfg().vapidPublicKey || '').trim();
      if(!publicKey || publicKey.includes('PASTE_')){
        setPushStatus('VAPID public key belum dimasukkan dalam admin/assets/push-config.js', 'error');
        alert('VAPID public key belum dimasukkan. Generate VAPID keys dahulu, kemudian update admin/assets/push-config.js.');
        return;
      }
      if(!('Notification' in window)){ setPushStatus('Browser ini tidak sokong Notification API.', 'error'); return; }
      const permission = await Notification.requestPermission();
      if(permission !== 'granted'){ setPushStatus('Permission notification tidak dibenarkan.', 'error'); return; }
      const reg = await registerServiceWorker();
      let sub = await reg.pushManager.getSubscription();
      if(!sub){
        sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:urlBase64ToUint8Array(publicKey)});
      }
      const sb = await getClient();
      if(!sb){ setPushStatus('Supabase client tidak tersedia.', 'error'); return; }
      const session = (JSON.parse(localStorage.getItem('rh_staff_session') || 'null') || {});
      const payload = {
        endpoint: sub.endpoint,
        subscription: sub.toJSON(),
        staff_id: session.staff_id || null,
        device_label: navigator.userAgent.slice(0,180),
        user_agent: navigator.userAgent,
        is_active: true,
        updated_at: new Date().toISOString()
      };
      const {error} = await sb.from(cfg().subscriptionTable || 'push_subscriptions').upsert(payload, {onConflict:'endpoint'});
      if(error){ setPushStatus('Gagal simpan subscription: ' + error.message, 'error'); return; }
      localStorage.setItem('rh_push_enabled','yes');
      setPushStatus('Push aktif untuk phone/browser ini.', 'ok');
      await showLocalNotification('✅ RH Push Aktif', {body:'Telefon ini sudah didaftarkan untuk notifikasi lead.', icon:'/assets/rh-logo.png', tag:'rh-push-test', requireInteraction:false, data:{url:'/admin/leads.html'}});
    }catch(err){
      console.error(err);
      setPushStatus('Push gagal: ' + (err.message || err), 'error');
      alert('Push gagal: ' + (err.message || err));
    }
  }
  async function testPush(){
    const lead = {id:'test', name:'Test Lead RH', phone:'0123456789', business_type:'Website / Aira', status:'new'};
    await notifyLead(lead, false);
    setPushStatus('Test notification dihantar. Jika tidak keluar, semak permission browser/phone.', 'info');
  }
  async function setupRealtime(){
    const sb = await getClient(); if(!sb || realtimeChannel) return;
    try{
      realtimeChannel = sb.channel('rh-lead-phone-push')
        .on('postgres_changes', {event:'INSERT', schema:'public', table:'leads'}, payload => {
          const lead = payload.new || {};
          if(lead.created_at && (!lastSeenLeadAt || lead.created_at > lastSeenLeadAt)){
            lastSeenLeadAt = lead.created_at;
            localStorage.setItem('rh_last_seen_lead_at', lastSeenLeadAt);
          }
          notifyLead(lead, false);
        })
        .subscribe();
    }catch(e){ console.warn('Realtime push setup skipped', e); }
  }
  function injectPanel(){
    if($('#rhPushPanel')) return;
    const target = $('.top-actions') || $('.content') || document.body;
    const panel = document.createElement('div');
    panel.id = 'rhPushPanel';
    panel.className = 'rh-push-panel';
    panel.innerHTML = `<button id="rhEnablePushBtn" class="ghost-btn" type="button">Aktifkan Push</button><button id="rhTestPushBtn" class="ghost-btn" type="button">Test Notification</button><span id="rhPushStatus" class="rh-push-status">Push belum aktif</span>`;
    target.appendChild(panel);
    $('#rhEnablePushBtn', panel).onclick = enablePush;
    $('#rhTestPushBtn', panel).onclick = testPush;
  }
  async function init(){
    injectPanel();
    if('Notification' in window){ setPushStatus(`Permission: ${Notification.permission}`, Notification.permission==='granted'?'ok':'info'); }
    try{ await registerServiceWorker(); }catch(e){}
    setupRealtime();
  }
  window.RHLeadPush = {init, enablePush, testPush, notifyLead};
  document.addEventListener('DOMContentLoaded', init);
})();
