(function(){
  const SUPABASE_CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const cfg=window.RH_SUPABASE_CONFIG||{};
  let client=null;
  function loadSupabase(){return new Promise(resolve=>{if(window.supabase){resolve(true);return;}const s=document.createElement('script');s.src=SUPABASE_CDN;s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.head.appendChild(s);});}
  async function getClient(){if(client)return client;if(!cfg.url||!cfg.anonKey||cfg.url.includes('PASTE_'))throw new Error('Supabase config belum lengkap.');const ok=await loadSupabase();if(!ok||!window.supabase)throw new Error('Supabase library gagal dimuatkan.');client=window.supabase.createClient(cfg.url,cfg.anonKey);return client;}
  async function getSession(){const c=await getClient();const {data,error}=await c.auth.getSession();if(error)throw error;return data.session||null;}
  async function requireAdmin(){const c=await getClient();const session=await getSession();if(!session){location.href='admin-login.html';return null;}const {data,error}=await c.from('admin_users').select('user_id,is_active').eq('user_id',session.user.id).eq('is_active',true).maybeSingle();if(error||!data){await c.auth.signOut();location.href='admin-login.html';return null;}return {client:c,session,admin:data};}
  async function signOut(){const c=await getClient();await c.auth.signOut();location.href='admin-login.html';}
  window.RH_ADMIN_AUTH={getClient,getSession,requireAdmin,signOut};
})();
