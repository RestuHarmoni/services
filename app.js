const menuToggle=document.getElementById('menuToggle');const navLinks=document.getElementById('navLinks');const header=document.querySelector('.site-header');if(menuToggle&&navLinks){menuToggle.addEventListener('click',()=>{const isOpen=navLinks.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(isOpen));document.body.classList.toggle('menu-open',isOpen)});navLinks.querySelectorAll('a').forEach(link=>{link.addEventListener('click',()=>{navLinks.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')})})}const onScroll=()=>{if(header)header.classList.toggle('scrolled',window.scrollY>18)};window.addEventListener('scroll',onScroll,{passive:true});onScroll();const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();const reveals=document.querySelectorAll('.reveal');if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.12});reveals.forEach(item=>observer.observe(item))}else{reveals.forEach(item=>item.classList.add('visible'))}
(function(){
  // Public website is intentionally NOT a PWA.
  // This block unregisters any old public service worker and clears old runtime caches
  // so visitors always receive the latest public website from Cloudflare/GitHub.
  const buildVersion = window.RH_APP_VERSION || window.RH_VERSION || 'v1-public-qa-final';
  const versionKey = 'rh_seen_app_version';

  async function clearRuntimeCaches(){
    try{
      if('caches' in window){
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    }catch(e){ console.warn('Public cache cleanup skipped:', e); }
  }

  async function disablePublicPWA(){
    try{
      localStorage.setItem(versionKey, buildVersion);
      if('serviceWorker' in navigator){
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      await clearRuntimeCaches();
    }catch(e){ console.warn('Public PWA cleanup skipped:', e); }
  }

  window.RH_FORCE_APP_UPDATE = disablePublicPWA;
  window.addEventListener('load', disablePublicPWA);
})();
