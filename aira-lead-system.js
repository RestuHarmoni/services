(function(){
  const SUPABASE_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const cfg=window.RH_SUPABASE_CONFIG||{};
  let supabaseClient=null;
  const DEFAULT_QUESTION_BANK={"version":"v12.0-aira-v3-sales-consultant-live-base","assistantName":"Aira","positioning":"AI Website Sales Consultant","intro":["👋 Hai, saya <strong>Aira</strong>.","Saya boleh bantu cadangkan website yang sesuai untuk bisnes anda dalam masa kurang 1 minit."],"steps":[{"key":"business_type","question":"Apakah jenis bisnes anda?","type":"choice","required":true,"options":["Servis","Produk","Restoran","Event","Hartanah","Company Profile","E-commerce","Custom System","Lain-lain"]},{"key":"domain_status","question":"Adakah anda sudah mempunyai domain?","type":"choice","required":false,"options":["Ya","Belum","Tidak Pasti"]},{"key":"hosting_status","question":"Adakah anda sudah mempunyai hosting?","type":"choice","required":false,"options":["Ya","Belum","Tidak Pasti"]},{"key":"objective","question":"Apakah objektif utama website anda?","type":"choice","required":true,"options":["Dapatkan Lead","Profil Syarikat","Jual Produk","Booking","SEO Google","Sistem / Portal Custom"]},{"key":"budget","question":"Budget anggaran?","type":"choice","required":true,"options":["RM799 (RH Basic)","RM1,999 (RH Growth)","RM2,999 (RH Ecosystem)","RM3,000+ (RH Enterprise)","Tidak Pasti"]},{"key":"timeline","question":"Bila anda mahu website mula siap atau dilancarkan?","type":"choice","required":true,"options":["Segera","1–2 minggu","Dalam 1 bulan","Belum pasti"]},{"key":"name","question":"Boleh saya tahu nama anda?","type":"input","input":true,"placeholder":"Contoh: Ahmad","required":true},{"key":"phone","question":"Nombor WhatsApp untuk team kami hubungi?","type":"input","input":true,"placeholder":"Contoh: 0123456789","required":true,"validation":"phone"}],"packages":{"RH Basic":{"price":"RM799","maintenance":"RM79/bulan","templateCount":1,"bestFor":["Personal website","Bisnes kecil","Profil ringkas","Landing page asas"],"features":["Website 1–3 halaman","Mobile responsive","Contact/WhatsApp CTA","SEO asas","Struktur profile ringkas"],"templateUrl":"/pakej/rh-basic/"},"RH Growth":{"price":"RM1999","maintenance":"RM129/bulan","templateCount":10,"bestFor":["Bisnes servis","Lead generation","Portfolio","SEO asas"],"features":["Semua RH Basic","Multi-page website","Service section","Blog / Artikel","Portfolio / Gallery","Lead capture","Aira assistant basic"],"templateUrl":"/pakej/rh-growth/"},"RH Ecosystem":{"price":"RM2999","maintenance":"RM249/bulan","templateCount":10,"bestFor":["Bisnes yang mahu sistem lengkap","AI Chatbot","Blog CMS","Dashboard","Lead Management"],"features":["Semua RH Growth","AI Chatbot Aira","Blog CMS","Admin Dashboard","Lead Management","Quotation/Invoice ready","Multi-section business website"],"templateUrl":"/pakej/rh-ecosystem/"},"RH Enterprise":{"price":"Custom","maintenance":"Ikut scope","templateCount":0,"bestFor":["Portal custom","Multi branch","Automation","CRM/ERP ringkas","Integrasi sistem"],"features":["Custom scope","System dashboard","Workflow automation","Advanced integration","Dedicated quotation"],"templateUrl":"/pakej/"}},"serviceRecommendations":{"Servis":{"recommendedPackage":"RH Growth","priorityObjective":["Dapatkan Lead","SEO Google","Booking"]},"Produk":{"recommendedPackage":"RH Growth","priorityObjective":["Jual Produk","Dapatkan Lead"]},"Restoran":{"recommendedPackage":"RH Growth","priorityObjective":["Booking","Profil Syarikat","Dapatkan Lead"]},"Event":{"recommendedPackage":"RH Ecosystem","priorityObjective":["Booking","Dapatkan Lead","Profil Syarikat"]},"Hartanah":{"recommendedPackage":"RH Growth","priorityObjective":["Dapatkan Lead","Profil Syarikat"]},"Company Profile":{"recommendedPackage":"RH Basic","priorityObjective":["Profil Syarikat"]},"E-commerce":{"recommendedPackage":"RH Ecosystem","priorityObjective":["Jual Produk"]},"Custom System":{"recommendedPackage":"RH Enterprise","priorityObjective":["Sistem / Portal Custom"]},"Lain-lain":{"recommendedPackage":"RH Basic","priorityObjective":["Profil Syarikat"]}}};
  const DEFAULT_FAQ_BANK={"version":"v12.0-aira-v3-sales-consultant-live-base","quickActions":["📦 Lihat Pakej","💰 Semak Harga","🖥️ Lihat Demo Website","💬 Dapatkan Cadangan"],"faq":[{"topic":"harga","triggers":["harga","kos","price","pakej","package","bayaran","berapa","lihat pakej","semak harga"],"answer":"<strong>Pakej rasmi RH:</strong><br><br>🥉 <strong>RH Basic</strong><br>RM799 + maintenance RM79/bulan<br>Sesuai untuk personal web, bisnes kecil dan profile ringkas.<br><a class=\"rh-aira-link\" href=\"/pakej/rh-basic/\" target=\"_blank\" rel=\"noopener\">Lihat RH Basic</a><br><br>🥈 <strong>RH Growth</strong><br>RM1999 + maintenance RM129/bulan<br>Sesuai untuk bisnes servis, portfolio, blog dan lead generation.<br><a class=\"rh-aira-link\" href=\"/pakej/rh-growth/\" target=\"_blank\" rel=\"noopener\">Lihat RH Growth</a><br><br>🥇 <strong>RH Ecosystem</strong><br>RM2999 + maintenance RM249/bulan<br>Sesuai untuk AI Chatbot, Blog CMS, Dashboard dan Lead Management.<br><a class=\"rh-aira-link\" href=\"/pakej/rh-ecosystem/\" target=\"_blank\" rel=\"noopener\">Lihat RH Ecosystem</a><br><br>🏢 <strong>RH Enterprise</strong><br>Custom quotation untuk sistem/portal khas."},{"topic":"demo","triggers":["demo","contoh","template","lihat demo","website contoh"],"answer":"Boleh. Anda boleh lihat contoh dan pakej website RH di halaman pakej rasmi:<br><br><a class=\"rh-aira-link\" href=\"/pakej/\" target=\"_blank\" rel=\"noopener\">Lihat pakej & demo website RH</a>"},{"topic":"tempoh","triggers":["lama","siap","tempoh","berapa hari","duration","ready"],"answer":"Kebanyakan website boleh siap dalam <strong>3–7 hari bekerja</strong> selepas bahan lengkap diterima. Projek custom mungkin mengambil masa lebih lama."},{"topic":"domain","triggers":["domain",".com",".my","nama website"],"answer":"Domain boleh disediakan atau dibantu setup. Jika anda belum ada domain, Aira akan rekodkan supaya team RH boleh cadangkan pilihan yang sesuai."},{"topic":"hosting","triggers":["hosting","server","online","publish"],"answer":"Ya, RH boleh bantu setup hosting dan publish website. Jika anda sudah ada hosting sendiri, team RH boleh semak dahulu kesesuaiannya."},{"topic":"seo","triggers":["seo","google","ranking","search","carian"],"answer":"Website disediakan dengan <strong>SEO asas</strong>: meta title, meta description, struktur heading, sitemap dan mobile responsive. Artikel blog boleh ditambah untuk SEO berterusan."},{"topic":"maintenance","triggers":["maintenance","support","bulanan","update","kemaskini"],"answer":"Maintenance bergantung pakej: RH Basic RM79/bulan, RH Growth RM129/bulan, RH Ecosystem RM249/bulan. Ia meliputi sokongan asas dan kemaskini yang dipersetujui."},{"topic":"facebook","triggers":["facebook","fb","page","website atau facebook"],"answer":"Facebook Page sesuai untuk engagement, tetapi website lebih kuat sebagai portfolio rasmi, SEO Google dan pusat lead capture. Yang terbaik ialah gunakan kedua-duanya bersama."}]};
  function safeJson(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
  function normalizeBank(qb,fb){
    qb=qb||DEFAULT_QUESTION_BANK; fb=fb||DEFAULT_FAQ_BANK;
    const steps=Array.isArray(qb.steps)?qb.steps:DEFAULT_QUESTION_BANK.steps;
    const byKey=Object.fromEntries(steps.map(s=>[s.key,s]));
    const bank={
      version:qb.version||DEFAULT_QUESTION_BANK.version,
      assistantName:qb.assistantName||"Aira",
      positioning:qb.positioning||"AI Website Consultant",
      intro:Array.isArray(qb.intro)?qb.intro:DEFAULT_QUESTION_BANK.intro,
      steps,
      businessOptions:(byKey.business_type&&byKey.business_type.options)||[],
      objectiveOptions:(byKey.objective&&byKey.objective.options)||[],
      budgetOptions:(byKey.budget&&byKey.budget.options)||[],
      timelineOptions:(byKey.timeline&&byKey.timeline.options)||[],
      quickActions:Array.isArray(fb.quickActions)?fb.quickActions:DEFAULT_FAQ_BANK.quickActions,
      faq:Array.isArray(fb.faq)?fb.faq:DEFAULT_FAQ_BANK.faq,
      packages:qb.packages||DEFAULT_QUESTION_BANK.packages||{}
    };
    return bank;
  }
  window.RH_AIRA_DEFAULT_FAQ_BANK = DEFAULT_FAQ_BANK;
  function isOfficialPackageBank(qb){return !!(qb&&qb.packages&&(qb.packages['RH Basic']||qb.packages['RH Starter'])&&qb.packages['RH Growth']&&qb.packages['RH Ecosystem']&&(String(qb.version||'').includes('v12.0-aira-v3-sales-consultant')||String(qb.version||'').includes('v11.0-package-template-linking')||String(qb.version||'').includes('v10.0-rh-official-package-alignment')));}
  function loadBank(){
    let qb=safeJson(localStorage.getItem("rh_aira_question_bank"),DEFAULT_QUESTION_BANK);
    let fb=safeJson(localStorage.getItem("rh_aira_faq_bank"),DEFAULT_FAQ_BANK);
    if(!isOfficialPackageBank(qb)){qb=DEFAULT_QUESTION_BANK;fb=DEFAULT_FAQ_BANK;}
    return normalizeBank(qb,fb);
  }
  let BANK=loadBank();
  async function loadRemoteBank(){
    if(window.RH_AIRA_DATA_SERVICE){
      const res=await window.RH_AIRA_DATA_SERVICE.loadAll();
      if(res&&res.questionBank){const qb=isOfficialPackageBank(res.questionBank)?res.questionBank:DEFAULT_QUESTION_BANK;const fb=isOfficialPackageBank(res.questionBank)?res.faqBank:DEFAULT_FAQ_BANK;BANK=normalizeBank(qb,fb);window.RH_AIRA_LEAD_SYSTEM.BANK=BANK;return {ok:true,source:res.source};}
    }
    return {ok:false,source:'localStorage'};
  }
  window.addEventListener('storage',e=>{if(e.key==='rh_aira_question_bank'||e.key==='rh_aira_faq_bank')location.reload();});
  function loadSupabase(){return window.RHLoadSupabaseLibrary?window.RHLoadSupabaseLibrary():Promise.resolve(!!window.supabase);}
  async function initSupabase(){if(supabaseClient)return supabaseClient;if(window.RHGetSupabaseClient){supabaseClient=await window.RHGetSupabaseClient();return supabaseClient;}if(!cfg.url||!cfg.anonKey||cfg.url.includes("PASTE_"))return null;const ok=await loadSupabase();if(!ok||!window.supabase)return null;supabaseClient=window.supabase.createClient(cfg.url,cfg.anonKey);return supabaseClient;}
  function normalizePhone(v){return String(v||"").replace(/[\s-]/g,"");}
  function validPhone(v){return /^(\+?6?01)[0-9]{7,10}$/.test(normalizePhone(v));}
  function scoreLead(data){
    const budget=String(data.budget||'');
    let score=40;
    if(budget.includes('799')||budget.includes('Basic'))score=40;
    else if(budget.includes('1999')||budget.includes('Growth'))score=70;
    else if(budget.includes('2999')||budget.includes('Ecosystem'))score=90;
    else if(budget.includes('3000')||budget.includes('Enterprise')||budget.includes('Custom'))score=100;
    else score=55;
    if(String(data.timeline||'').toLowerCase().includes('segera'))score+=5;
    if(String(data.objective||'').toLowerCase().includes('seo'))score+=5;
    return Math.min(score,100);
  }
  function removeRetry(clientRef){if(!clientRef)return;setRetryQueue(getRetryQueue().filter(x=>x.client_ref!==clientRef));}
  async function insertLeadSupabase(client,lead){
    const row=stripLeadForInsert(lead);
    const ins=await client.from("leads").insert([row]).select("id").single();
    if(ins.error)return{ok:false,error:ins.error};
    const inserted=ins.data;
    const answers=Array.isArray(lead.answers)?lead.answers:[];
    if(inserted&&inserted.id&&answers.length){
      const answerRows=answers.map(a=>({
        lead_id:inserted.id,
        question_key:a.question_key,
        question:a.question,
        answer:String(a.answer??''),
        sort_order:a.sort_order||0,
        answer_type:a.type||'choice'
      }));
      const ans=await client.from("lead_answers").insert(answerRows);
      if(ans.error)return{ok:true,warning:"Lead saved, tetapi jawapan detail gagal disimpan: "+ans.error.message};
    }
    return{ok:true};
  }
  async function retryQueuedLeads(){
    const client=await initSupabase();
    if(!client||!navigator.onLine)return{ok:false,mode:'offline'};
    const q=getRetryQueue();
    if(!q.length)return{ok:true,count:0};
    const remain=[]; let sent=0;
    for(const item of q){
      const last=item._last_try?new Date(item._last_try).getTime():0;
      if(Date.now()-last<30000){remain.push(item);continue;}
      const next={...item,_retry_count:(item._retry_count||0)+1,_last_try:new Date().toISOString()};
      const res=await insertLeadSupabase(client,next);
      if(res.ok){sent++;}
      else{remain.push(next);}
    }
    setRetryQueue(remain);
    return{ok:true,count:sent,remaining:remain.length};
  }
  function saveLocalLead(lead){const list=getLocalLeads();list.unshift({...lead,id:"LOCAL-"+Date.now(),created_at:new Date().toISOString()});localStorage.setItem("rh_leads",JSON.stringify(list));}
  function buildAnswerSnapshot(data){
    const steps=(BANK&&Array.isArray(BANK.steps))?BANK.steps:[];
    const answers=[];
    steps.forEach((step,idx)=>{
      if(!step||!step.key)return;
      const value=data[step.key];
      if(value===undefined||value===null||String(value).trim()==="")return;
      answers.push({
        question_key:step.key,
        question:step.question||step.key,
        answer:value,
        sort_order:idx+1,
        type:step.type||((step.input||step.validation)?"input":"choice")
      });
    });
    Object.keys(data||{}).forEach(key=>{
      if(['notes'].includes(key))return;
      if(answers.some(a=>a.question_key===key))return;
      const value=data[key];
      if(value===undefined||value===null||String(value).trim()==="")return;
      answers.push({question_key:key,question:key.replace(/_/g,' '),answer:value,sort_order:999,type:'extra'});
    });
    return answers;
  }
  function stripLeadForInsert(lead){
    const {answers,answer_snapshot,answers_json,client_ref,_retry_reason,_retry_count,_queued_at,_last_try,...row}=lead||{};
    return row;
  }
  async function saveLead(lead){
    const now=Date.now();
    const last=Number(localStorage.getItem("rh_last_lead_submit")||0);
    if(Date.now()-last<15000){return{ok:false,mode:"blocked",error:"Sila tunggu sebentar sebelum hantar semula."};}
    lead={...lead,client_ref:lead.client_ref||("RH-"+Date.now()+"-"+Math.random().toString(16).slice(2))};
    const client=await initSupabase();
    if(!client){
      saveLocalLead(lead);
      enqueueLeadRetry(lead,"Supabase belum tersedia / offline");
      localStorage.setItem("rh_last_lead_submit",String(now));
      return{ok:true,mode:"queued",warning:"Maklumat disimpan sementara dan akan dihantar semula automatik."};
    }
    const res=await insertLeadSupabase(client,lead);
    if(!res.ok){
      console.error("Aira lead Supabase insert failed:",res.error);
      saveLocalLead(lead);
      enqueueLeadRetry(lead,res.error&&res.error.message?res.error.message:"Insert failed");
      localStorage.setItem("rh_last_lead_submit",String(now));
      return{ok:false,mode:"queued",error:(res.error&&res.error.message)||"Supabase insert failed",warning:"Maklumat disimpan sementara dan akan retry automatik."};
    }
    removeRetry(lead.client_ref);
    localStorage.setItem("rh_last_lead_submit",String(now));
    return{ok:true,mode:"supabase",warning:res.warning};
  }
  window.addEventListener('online',()=>{retryQueuedLeads().catch(()=>{});});
  setTimeout(()=>{retryQueuedLeads().catch(()=>{});},2500);

  function matchFAQ(input){const q=String(input||"").toLowerCase();for(const item of BANK.faq){for(const trig of (item.triggers||[])){if(q.includes(String(trig).toLowerCase()))return item;}}return null;}
  function createLeadPayload(data){
    const recommended_package=packageFor(data),lead_score=scoreLead(data),answers=buildAnswerSnapshot(data);
    const compact=answers.map(a=>`${a.question}: ${a.answer}`).join(" | ");
    const notes=[data.notes||"",compact?"Aira Answers: "+compact:""];
    return{name:data.name,phone:normalizePhone(data.phone),business_type:data.business_type,domain_status:data.domain_status||data.has_domain,hosting_status:data.hosting_status,objective:data.objective,budget:data.budget,timeline:data.timeline,recommended_package,lead_score,lead_temperature:tempFor(lead_score),status:"NEW",notes:notes.filter(Boolean).join(" | "),source:"Aira",page_url:location.href,user_agent:navigator.userAgent,answers};
  }
  window.RH_AIRA_LEAD_SYSTEM={BANK,DEFAULT_QUESTION_BANK,DEFAULT_FAQ_BANK,loadRemoteBank,initSupabase,normalizePhone,validPhone,scoreLead,packageFor,priceFor,maintenanceFor,tempFor,featuresFor,getLocalLeads,getRetryQueue,retryQueuedLeads,saveLead,createLeadPayload,buildAnswerSnapshot,matchFAQ};
})();
