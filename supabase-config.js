/* RH Services v9.0 Production Cleanup
   Centralized Supabase browser client.
   Semua module live perlu guna window.RHGetSupabaseClient() supaya GoTrueClient tidak dicipta berulang kali. */
window.RH_SUPABASE_CONFIG = {
  url: "https://xyiqrjiozrxcqhifyfzw.supabase.co",
  anonKey: "sb_publishable_SKmoaAwiMvWEzW8OIF4OMA_WusAmQiE"
};

(function(){
  const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  let loadingPromise = null;
  let clientPromise = null;

  function hasValidConfig(){
    const cfg = window.RH_SUPABASE_CONFIG || {};
    return !!(cfg.url && cfg.anonKey && !String(cfg.url).includes('PASTE_') && !String(cfg.anonKey).includes('PASTE_'));
  }

  function loadSupabaseLibrary(){
    if (window.supabase && typeof window.supabase.createClient === 'function') return Promise.resolve(true);
    if (loadingPromise) return loadingPromise;
    loadingPromise = new Promise(resolve => {
      const existing = document.querySelector('script[data-rh-supabase-js="true"], script[src*="@supabase/supabase-js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(!!window.supabase), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        setTimeout(() => resolve(!!window.supabase), 1600);
        return;
      }
      const s = document.createElement('script');
      s.src = CDN;
      s.async = true;
      s.dataset.rhSupabaseJs = 'true';
      s.onload = () => resolve(!!window.supabase);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
    return loadingPromise;
  }

  async function getSupabaseClient(options){
    options = options || {};
    if (window.RH_SUPABASE_CLIENT) return window.RH_SUPABASE_CLIENT;
    if (clientPromise) return clientPromise;
    if (!hasValidConfig()) {
      if (options.throwOnMissing) throw new Error('Supabase config belum lengkap.');
      return null;
    }
    const ok = await loadSupabaseLibrary();
    if (!ok || !window.supabase || typeof window.supabase.createClient !== 'function') {
      if (options.throwOnMissing) throw new Error('Supabase library gagal dimuatkan.');
      return null;
    }
    clientPromise = Promise.resolve().then(() => {
      if (window.RH_SUPABASE_CLIENT) return window.RH_SUPABASE_CLIENT;
      const cfg = window.RH_SUPABASE_CONFIG;
      window.RH_SUPABASE_CLIENT = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return window.RH_SUPABASE_CLIENT;
    });
    return clientPromise;
  }

  window.RHLoadSupabaseLibrary = loadSupabaseLibrary;
  window.RHGetSupabaseClient = getSupabaseClient;
})();
