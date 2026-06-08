const menuToggle=document.getElementById('menuToggle');const navLinks=document.getElementById('navLinks');const header=document.querySelector('.site-header');if(menuToggle&&navLinks){menuToggle.addEventListener('click',()=>{const isOpen=navLinks.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(isOpen));document.body.classList.toggle('menu-open',isOpen)});navLinks.querySelectorAll('a').forEach(link=>{link.addEventListener('click',()=>{navLinks.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')})})}const onScroll=()=>{if(header)header.classList.toggle('scrolled',window.scrollY>18)};window.addEventListener('scroll',onScroll,{passive:true});onScroll();const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();const reveals=document.querySelectorAll('.reveal');if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.12});reveals.forEach(item=>observer.observe(item))}else{reveals.forEach(item=>item.classList.add('visible'))}
(function(){
  const buildVersion = window.RH_APP_VERSION || window.RH_VERSION || '6.4.5-auto-sw-lead-retry';
  const versionKey = 'rh_seen_app_version';
  const reloadKey = 'rh_auto_reloaded_for_version';
  async function clearRuntimeCaches(){
    try{ if('caches' in window){ const keys=await caches.keys(); await Promise.all(keys.map(k=>caches.delete(k))); } }catch(e){ console.warn('Cache clear skipped:', e); }
  }
  async function recoverIfVersionChanged(){
    const seen = localStorage.getItem(versionKey);
    if(seen && seen !== buildVersion && localStorage.getItem(reloadKey) !== buildVersion){
      localStorage.setItem(reloadKey, buildVersion);
      localStorage.setItem(versionKey, buildVersion);
      try{
        if('serviceWorker' in navigator){
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
        await clearRuntimeCaches();
      }catch(e){ console.warn('Auto update recovery skipped:', e); }
      const u = new URL(location.href);
      u.searchParams.set('rhv', buildVersion);
      location.replace(u.toString());
      return true;
    }
    localStorage.setItem(versionKey, buildVersion);
    return false;
  }
  window.RH_FORCE_APP_UPDATE = async function(){
    localStorage.removeItem(reloadKey);
    localStorage.setItem(versionKey, 'force-old');
    return recoverIfVersionChanged();
  };
  if('serviceWorker' in navigator){
    window.addEventListener('load', async ()=>{
      const recovering = await recoverIfVersionChanged();
      if(recovering) return;
      navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(buildVersion)}`).then(reg=>{
        if(reg.update) reg.update();
        if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
        reg.addEventListener('updatefound',()=>{
          const newWorker=reg.installing;
          if(!newWorker)return;
          newWorker.addEventListener('statechange',()=>{
            if(newWorker.state==='installed'&&navigator.serviceWorker.controller){
              newWorker.postMessage({type:'SKIP_WAITING'});
            }
          });
        });
      }).catch(error=>console.warn('Service worker registration failed:',error));
      let refreshing=false;
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(refreshing)return;
        refreshing=true;
        const u=new URL(location.href);u.searchParams.set('rhv',buildVersion);window.location.replace(u.toString());
      });
      navigator.serviceWorker.addEventListener('message', event=>{
        if(event.data&&event.data.type==='RH_SW_UPDATED'&&event.data.version===buildVersion&&localStorage.getItem(reloadKey)!==buildVersion){
          localStorage.setItem(reloadKey,buildVersion);
          const u=new URL(location.href);u.searchParams.set('rhv',buildVersion);window.location.replace(u.toString());
        }
      });
    });
  }
})();
