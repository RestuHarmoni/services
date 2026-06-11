(function(){
  const SUPABASE_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const cfg=window.RH_SUPABASE_CONFIG||{};
  const TABLE='aira_settings';
  const LS_Q='rh_aira_question_bank';
  const LS_F='rh_aira_faq_bank';
  const LS_DRAFT='rh_aira_admin_draft';
  let client=null;
  function safeJson(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
  function clone(v){return typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));}
  function loadScript(){return window.RHLoadSupabaseLibrary?window.RHLoadSupabaseLibrary():Promise.resolve(!!window.supabase);}
  async function getClient(){
    if(client)return client;
    if(window.RHGetSupabaseClient){client=await window.RHGetSupabaseClient();return client;}
    if(!cfg.url||!cfg.anonKey||String(cfg.url).includes('PASTE_'))return null;
    const ok=await loadScript(); if(!ok||!window.supabase)return null;
    client=window.supabase.createClient(cfg.url,cfg.anonKey);
    return client;
  }
  function defaults(){
    const q=window.DEFAULT_AIRA_QUESTIONS||window.RH_AIRA_DEFAULT_QUESTION_BANK||null;
    const f=window.DEFAULT_AIRA_FAQ||window.RH_AIRA_DEFAULT_FAQ_BANK||null;
    return {questionBank:clone(q||{version:'local',steps:[],packages:{}}),faqBank:clone(f||{version:'local',quickActions:[],faq:[]})};
  }
  function readLocal(){
    const d=defaults();
    return {
      questionBank:safeJson(localStorage.getItem(LS_Q),d.questionBank),
      faqBank:safeJson(localStorage.getItem(LS_F),d.faqBank),
      source:'localStorage'
    };
  }
  function writeLocal(questionBank,faqBank){
    localStorage.setItem(LS_Q,JSON.stringify(questionBank));
    localStorage.setItem(LS_F,JSON.stringify(faqBank));
    localStorage.setItem(LS_DRAFT,JSON.stringify({questionBank,faqBank,updated_at:new Date().toISOString()}));
  }
  async function readSupabase(){
    const c=await getClient(); if(!c)return {ok:false,error:'Supabase belum dikonfigurasi'};
    const {data,error}=await c.from(TABLE).select('key,value,updated_at').in('key',['question_bank','faq_bank']);
    if(error)return {ok:false,error:error.message};
    const d=defaults();
    const map={}; (data||[]).forEach(row=>map[row.key]=row.value);
    if(!map.question_bank&&!map.faq_bank)return {ok:false,error:'Table aira_settings kosong'};
    return {ok:true,questionBank:map.question_bank||d.questionBank,faqBank:map.faq_bank||d.faqBank,source:'supabase'};
  }
  async function loadAll(){
    const remote=await readSupabase();
    if(remote.ok){writeLocal(remote.questionBank,remote.faqBank);return remote;}
    const local=readLocal();
    local.warning=remote.error;
    return local;
  }
  async function publishAll(questionBank,faqBank){
    writeLocal(questionBank,faqBank);
    const c=await getClient();
    if(!c)return {ok:false,mode:'localStorage',error:'Supabase belum dikonfigurasi. Draft disimpan dalam browser admin.'};
    const now=new Date().toISOString();
    const rows=[
      {key:'question_bank',value:questionBank,updated_at:now},
      {key:'faq_bank',value:faqBank,updated_at:now}
    ];
    const {error}=await c.from(TABLE).upsert(rows,{onConflict:'key'});
    if(error)return {ok:false,mode:'localStorage',error:error.message};
    return {ok:true,mode:'supabase'};
  }
  async function seedDefaults(questionBank,faqBank){return publishAll(questionBank||defaults().questionBank,faqBank||defaults().faqBank);}
  window.RH_AIRA_DATA_SERVICE={loadAll,publishAll,seedDefaults,readSupabase,readLocal,writeLocal,getClient,TABLE};
})();
