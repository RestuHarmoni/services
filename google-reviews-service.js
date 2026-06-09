(function(){
  const SUPABASE_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const cfg=window.RH_SUPABASE_CONFIG||{};
  const TABLE='aira_settings';
  const KEY='google_reviews';
  const LS='rh_google_reviews_bank';
  let client=null;
  function clone(v){try{return structuredClone(v)}catch(e){return JSON.parse(JSON.stringify(v));}}
  function safeJson(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
  function defaults(){return clone(window.RH_DEFAULT_GOOGLE_REVIEWS||{
    version:'1.0.0',
    title:'Apa Kata Pelanggan Kami',
    subtitle:'Pelanggan menghargai proses yang mudah, komunikasi yang jelas dan website yang kemas.',
    googleReviewUrl:'https://g.page/r/CTOjpXjmtEJwEAI/review',
    googleProfileUrl:'https://g.page/r/CTOjpXjmtEJwEAI',
    reviews:[
      {name:'Review Google #1',rating:5,text:'Masukkan review Google sebenar melalui Admin → Google Reviews.',source:'Google Review',active:false,order:1},
      {name:'Review Google #2',rating:5,text:'Masukkan review Google sebenar melalui Admin → Google Reviews.',source:'Google Review',active:false,order:2},
      {name:'Review Google #3',rating:5,text:'Masukkan review Google sebenar melalui Admin → Google Reviews.',source:'Google Review',active:false,order:3},
      {name:'Review Google #4',rating:5,text:'Masukkan review Google sebenar melalui Admin → Google Reviews.',source:'Google Review',active:false,order:4},
      {name:'Review Google #5',rating:5,text:'Masukkan review Google sebenar melalui Admin → Google Reviews.',source:'Google Review',active:false,order:5}
    ]
  });}
  function loadScript(){return new Promise(resolve=>{if(window.supabase)return resolve(true);const s=document.createElement('script');s.src=SUPABASE_CDN;s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.head.appendChild(s);});}
  async function getClient(){if(client)return client;if(!cfg.url||!cfg.anonKey||String(cfg.url).includes('PASTE_'))return null;const ok=await loadScript();if(!ok||!window.supabase)return null;client=window.supabase.createClient(cfg.url,cfg.anonKey);return client;}
  function readLocal(){return safeJson(localStorage.getItem(LS),defaults());}
  function writeLocal(data){localStorage.setItem(LS,JSON.stringify(data));}
  async function readSupabase(){const c=await getClient();if(!c)return {ok:false,error:'Supabase belum dikonfigurasi'};const {data,error}=await c.from(TABLE).select('key,value,updated_at').eq('key',KEY).maybeSingle();if(error)return {ok:false,error:error.message};if(!data||!data.value)return {ok:false,error:'Google Reviews belum dipublish'};return {ok:true,reviews:data.value,source:'supabase'};}
  async function loadAll(){const remote=await readSupabase();if(remote.ok){writeLocal(remote.reviews);return remote;}const local=readLocal();return {ok:true,reviews:local,source:'localStorage',warning:remote.error};}
  async function publishAll(data){writeLocal(data);const c=await getClient();if(!c)return {ok:false,mode:'localStorage',error:'Supabase belum dikonfigurasi. Draft disimpan localStorage.'};const row={key:KEY,value:data,updated_at:new Date().toISOString()};const {error}=await c.from(TABLE).upsert(row,{onConflict:'key'});if(error)return {ok:false,error:error.message};return {ok:true,mode:'supabase'};}
  window.RH_GOOGLE_REVIEWS_SERVICE={loadAll,publishAll,readLocal,writeLocal,readSupabase,getClient,defaults,TABLE,KEY};
})();
