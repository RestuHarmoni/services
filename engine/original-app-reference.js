
const SUPABASE_CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
let _client=null;
async function loadSupabase(){ if(window.supabase) return true; return new Promise(res=>{const s=document.createElement('script');s.src=SUPABASE_CDN;s.onload=()=>res(true);s.onerror=()=>res(false);document.head.appendChild(s);}); }
async function db(){ if(_client) return _client; const cfg=window.RH_SUPABASE_CONFIG||{}; if(!cfg.url||!cfg.anonKey) throw new Error('Supabase config belum lengkap.'); const ok=await loadSupabase(); if(!ok) throw new Error('Gagal load Supabase JS.'); _client=window.supabase.createClient(cfg.url,cfg.anonKey); return _client; }
const $=(s,root=document)=>root.querySelector(s); const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
function toast(msg,type='notice'){const el=$('#message'); if(!el){alert(msg);return;} el.className='notice '+(type==='error'?'error':type==='ok'?'ok':''); el.textContent=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),5000)}
function fmt(d){return d?new Date(d).toLocaleString('ms-MY'):''} function esc(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
async function session(){const c=await db(); const {data}=await c.auth.getSession(); return data.session||null}
async function requireAdmin(){const c=await db(); const s=await session(); if(!s){location.href='login.html';return null;} const {data,error}=await c.from('admin_users').select('*').eq('user_id',s.user.id).maybeSingle(); if(error||!data||data.is_active===false){await c.auth.signOut(); location.href='login.html'; return null;} return {c,s,admin:data}}
async function logout(){const c=await db(); await c.auth.signOut(); location.href='login.html'}

function getDashboardVoiceSettings(){
  const defaults={enabled:true,briefing:true,text:'Assalamualaikum. Bismillahirrahmanirrahim. Selamat datang ke Office RH AI Command Center.',voiceName:'',rate:0.92,pitch:1.08};
  try{
    const modern=JSON.parse(localStorage.getItem('officeRhDashboardVoiceSettings')||'{}');
    const legacy=JSON.parse(localStorage.getItem('officeRhLoginVoiceSettings')||'{}');
    return {...defaults,...legacy,...modern};
  }catch(e){return defaults}
}
function setDashboardVoiceSettings(settings){localStorage.setItem('officeRhDashboardVoiceSettings',JSON.stringify({...getDashboardVoiceSettings(),...settings}));}
function getLoginVoiceSettings(){return getDashboardVoiceSettings();}
function setLoginVoiceSettings(settings){return setDashboardVoiceSettings(settings);}
function pickLoginVoice(preferred=''){
  const voices=window.speechSynthesis?.getVoices?.()||[];
  if(!voices.length) return null;
  if(preferred){const exact=voices.find(v=>v.name===preferred); if(exact) return exact;}
  return voices.find(v=>/female|woman|zira|hazel|samantha|google uk english female|siti|malay/i.test(v.name))
    || voices.find(v=>/ms-|id-|en-/i.test(v.lang))
    || voices[0];
}
function buildDashboardBriefingText(metrics={}){
  const settings=getDashboardVoiceSettings();
  const base=settings.text||'Assalamualaikum. Bismillahirrahmanirrahim. Selamat datang ke Office RH AI Command Center.';
  if(settings.briefing===false) return base;
  const activeTasks=Number(metrics.activeTasks||0);
  const pendingReviews=Number(metrics.pendingReviews||0);
  const production=Number(metrics.production||0);
  const activeProjects=Number(metrics.activeProjects||0);
  return `${base} Anda mempunyai ${activeTasks} tugasan aktif, ${pendingReviews} review menunggu semakan, ${production} projek dalam final production, dan ${activeProjects} projek aktif.`;
}
function playDashboardGreeting(force=false, metrics={}){
  const settings=getDashboardVoiceSettings();
  if(!force && settings.enabled===false) return Promise.resolve();
  if(!force && sessionStorage.getItem('officeRhDashboardGreetingPlayed')==='1') return Promise.resolve();
  if(!('speechSynthesis' in window)) return Promise.resolve();
  return new Promise(resolve=>{
    try{
      const speakNow=()=>{
        const u=new SpeechSynthesisUtterance(buildDashboardBriefingText(metrics));
        const voice=pickLoginVoice(settings.voiceName);
        if(voice) u.voice=voice;
        u.lang=voice?.lang||'ms-MY';
        u.rate=Number(settings.rate)||0.92;
        u.pitch=Number(settings.pitch)||1.08;
        u.volume=1;
        u.onend=()=>resolve();
        u.onerror=()=>resolve();
        if(!force) sessionStorage.setItem('officeRhDashboardGreetingPlayed','1');
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        setTimeout(resolve,9000);
      };
      if((window.speechSynthesis.getVoices?.()||[]).length) speakNow();
      else { window.speechSynthesis.onvoiceschanged=speakNow; setTimeout(speakNow,600); }
    }catch(e){resolve();}
  });
}
function playLoginGreeting(force=false){return playDashboardGreeting(force, window.OFFICE_RH_DASHBOARD_METRICS||{});}
function populateVoiceSelect(){
  const sel=document.querySelector('[name="voice_name"]'); if(!sel || !('speechSynthesis' in window)) return;
  const settings=getDashboardVoiceSettings();
  const voices=window.speechSynthesis.getVoices?.()||[];
  sel.innerHTML='<option value="">Auto pilih voice wanita jika ada</option>'+voices.map(v=>`<option value="${esc(v.name)}" ${v.name===settings.voiceName?'selected':''}>${esc(v.name)} · ${esc(v.lang)}</option>`).join('');
}
function saveLoginVoiceSettings(e){
  e.preventDefault();
  const fd=new FormData(e.target);
  setDashboardVoiceSettings({enabled:fd.get('enabled')==='true',briefing:fd.get('briefing')==='true',text:String(fd.get('text')||'').trim(),voiceName:String(fd.get('voice_name')||''),rate:Number(fd.get('rate')||0.92),pitch:Number(fd.get('pitch')||1.08)});
  toast('AI Assistant dashboard voice setting disimpan pada browser ini. Untuk semua admin, nanti kita pindahkan ke table system_settings.','ok');
}
function deptAvatar(name='', code='AI'){
  const seed=String(name||code||'AI');
  const initials=seed.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'AI';
  return `<div class="staff-avatar" title="${esc(seed)}"><span>${esc(initials)}</span><i></i></div>`;
}
function staffChip(name='', role='', code='AI'){
  return `<div class="staff-chip">${deptAvatar(name,code)}<div><b>${esc(name||'Digital Staff')}</b><small>${esc(role||'AI Department')}</small></div><em>AI</em></div>`;
}
function navActive(active, items){return items.some(x=>x[0]===active)?'active':''}
function shell(active,title,subtitle){
  const production=[['intakes.html','Project Intakes','IN'],['clients.html','Clients','CL'],['projects.html','Projects','PR'],['tasks.html','Tasks','TK'],['reviews.html','Reviews','RV'],['final-production.html','Final Production','FP'],['completed-projects.html','Completed','CP']];
  const aiCenter=[['workspaces.html','Workspaces','WS'],['prompt-library.html','Prompt Library','PL']];
  const system=[['settings.html','Settings','ST']];
  const subLinks=(items)=>items.map(([u,n,ic])=>`<a class="smart-sub ${active===u?'active':''}" href="${u}"><b>${ic}</b><span>${n}</span></a>`).join('');
  document.body.innerHTML=`
  <div class="aurora-bg"><span></span><span></span><span></span></div>
  <div class="layout smart-layout">
    <aside class="sidebar smart-sidebar" id="side">
      <div class="brand-block smart-brand"><img src="branding/rh-logo.png" class="brand-logo" onerror="this.style.display='none'"><div><div class="brand">OFFICE RH</div><small>AI Operating System</small></div></div>
      <div class="ai-orb smart-ai"><b>AI</b><small>AIRA Command Core<br><strong>Online</strong></small></div>
      <nav class="nav smart-nav">
        <a class="smart-main ${active==='dashboard.html'?'active':''}" href="dashboard.html"><b>⌂</b><span>Dashboard</span></a>
        <div class="smart-group ${navActive(active,production)}"><button type="button" class="smart-main" onclick="this.parentElement.classList.toggle('open')"><b>◉</b><span>Production Hub</span><i>▾</i></button><div class="smart-subnav">${subLinks(production)}</div></div>
        <div class="smart-group ${navActive(active,aiCenter)}"><button type="button" class="smart-main" onclick="this.parentElement.classList.toggle('open')"><b>🤖</b><span>AI Center</span><i>▾</i></button><div class="smart-subnav">${subLinks(aiCenter)}</div></div>
        <div class="smart-group ${navActive(active,system)}"><button type="button" class="smart-main" onclick="this.parentElement.classList.toggle('open')"><b>⚙</b><span>System</span><i>▾</i></button><div class="smart-subnav">${subLinks(system)}</div></div>
      </nav>
      <div class="smart-user-card"><div class="mini-avatar"><span>RH</span><i></i></div><div><b>Admin</b><small>Secure Session</small></div><button class="smart-logout" onclick="logout()" title="Logout">⏻</button></div>
      <div class="side-status smart-status"><div class="pulse"></div><div><b>System Live</b><small>Supabase · Cloudflare · Office RH</small></div></div>
    </aside>
    <main class="main"><div class="topbar"><div><button class="btn secondary mobile-menu" onclick="document.getElementById('side').classList.toggle('open')">Menu</button><div class="h1">${title}</div><div class="sub">${subtitle||''}</div></div><div class="toolbar"><a class="btn secondary" href="project-intake.html" target="_blank">Public Intake Form</a><a class="btn" href="projects.html">Projects</a></div></div><div id="message" class="notice hidden"></div><div id="app" class="page-enter"></div></main>
  </div>
  <div class="smart-dock"><a href="dashboard.html" title="Dashboard">⌂</a><a href="reviews.html" title="Reviews">🔔</a><a href="prompt-library.html" title="AI Prompt Library">🤖</a><button type="button" title="Quick Actions" onclick="document.body.classList.toggle('quick-open')">＋</button></div>
  <div class="quick-panel"><b>Quick Actions</b><a href="project-intake.html" target="_blank">+ New Intake</a><a href="clients.html">Open Clients</a><a href="projects.html">Open Projects</a><a href="tasks.html">Open Tasks</a></div>`
}
async function initLogin(){
  const c=await db();
  const form=$('#loginForm');
  const btn=$('#loginButton');
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    document.body.classList.add('login-processing');
    if(btn) btn.querySelector('span').textContent='Mengesahkan akses';
    const email=$('#email').value.trim();
    const password=$('#password').value;
    const {data,error}=await c.auth.signInWithPassword({email,password});
    if(error){document.body.classList.remove('login-processing'); if(btn) btn.querySelector('span').textContent='Login ke Dashboard'; return toast('Login gagal: '+error.message,'error');}
    const uid=data?.user?.id;
    const {data:admin,error:adminErr}=await c.from('admin_users').select('*').eq('user_id',uid).maybeSingle();
    if(adminErr){
      await c.auth.signOut(); document.body.classList.remove('login-processing'); if(btn) btn.querySelector('span').textContent='Login ke Dashboard';
      return toast('Login Auth berjaya, tetapi semakan admin_users gagal: '+adminErr.message,'error');
    }
    if(!admin){
      await c.auth.signOut(); document.body.classList.remove('login-processing'); if(btn) btn.querySelector('span').textContent='Login ke Dashboard';
      return toast('Login Auth berjaya, tetapi user ini belum didaftarkan dalam table admin_users. Masukkan UUID user ke admin_users dahulu.','error');
    }
    if(admin.is_active===false){
      await c.auth.signOut(); document.body.classList.remove('login-processing'); if(btn) btn.querySelector('span').textContent='Login ke Dashboard';
      return toast('Akaun admin ini tidak aktif.','error');
    }
    const loginSteps=['Akses disahkan','Loading Office RH','Initializing AI Workforce','Connecting Departments'];
    for (const step of loginSteps) {
      if(btn) btn.querySelector('span').textContent=step;
      toast(step+'...','ok');
      await new Promise(resolve=>setTimeout(resolve,420));
    }
    sessionStorage.removeItem('officeRhDashboardGreetingPlayed');
    location.href='dashboard.html';
  });
}
function dashStatusCount(rows,field,status){return (rows||[]).filter(r=>String(r?.[field]||'').toUpperCase()===status).length}
function dashOpenCount(rows,field,closed){const c=(closed||[]).map(x=>String(x).toUpperCase()); return (rows||[]).filter(r=>!c.includes(String(r?.[field]||'').toUpperCase())).length}
function dashEmpty(msg){return `<p class="muted dash-empty">${esc(msg)}</p>`}
function outputText(content){
  if(!content) return '-';
  if(typeof content==='string') return content;
  if(content.content) return String(content.content);
  try{return JSON.stringify(content,null,2)}catch(e){return String(content)}
}
function latestByOutputId(rows){
  const m=new Map();
  (rows||[]).forEach(r=>{
    const k=r.output_id || r.office_department_outputs?.output_id || Math.random().toString(36);
    const old=m.get(k);
    const a=new Date(r.reviewed_at||r.created_at||0).getTime();
    const b=new Date(old?.reviewed_at||old?.created_at||0).getTime();
    if(!old || a>=b)m.set(k,r);
  });
  return [...m.values()];
}

async function getProjectBundle(projectId){
  const c=await db();
  const {data:project,error:pe}=await c.from('office_projects').select('*,office_clients(*)').eq('project_id',projectId).single();
  if(pe) throw pe;
  const [tasksRes,outputsRes,reviewsRes,finalsRes,intakeRes]=await Promise.all([
    c.from('office_tasks').select('*,office_departments(*)').eq('project_id',projectId).order('created_at'),
    c.from('office_department_outputs').select('*,office_departments(*)').eq('project_id',projectId).order('submitted_at',{ascending:false}),
    c.from('office_reviews').select('*,office_department_outputs(project_id,task_id,department_id,output_content,output_status)').order('reviewed_at',{ascending:false}),
    c.from('office_final_production').select('*').eq('project_id',projectId).order('created_at',{ascending:false}),
    project?.intake_id ? c.from('office_project_intakes').select('*').eq('intake_id',project.intake_id).maybeSingle() : Promise.resolve({data:null,error:null})
  ]);
  const err=tasksRes.error||outputsRes.error||reviewsRes.error||finalsRes.error||intakeRes.error; if(err) throw err;
  return {project,tasks:tasksRes.data||[],outputs:outputsRes.data||[],reviews:(reviewsRes.data||[]).filter(r=>r.office_department_outputs?.project_id===projectId),finals:finalsRes.data||[],intake:intakeRes.data||null};
}
function approvedOutputForTask(bundle,task){
  return (bundle.outputs||[]).find(o=>o.task_id===task.task_id && String(o.output_status||'').toUpperCase()==='APPROVED');
}
function projectCompletionGate(bundle){
  const p=bundle.project||{};
  const final=(bundle.finals||[])[0];
  const pStatus=String(p.project_status||'').toUpperCase();
  const fStatus=String(final?.production_status||'').toUpperCase();
  const ready=['READY_FOR_PREVIEW','CLIENT_APPROVED','READY_FOR_DELIVERY','DELIVERED','COMPLETED'];
  if(ready.includes(pStatus) || ready.includes(fStatus)) return {ok:true,reason:'AI Production website telah dijana.'};
  const tasks=bundle.tasks||[];
  if(!tasks.length) return {ok:false,reason:'Website belum dijana oleh AI Production.'};
  const pending=tasks.filter(t=>String(t.task_status||'').toUpperCase()!=='COMPLETED' && !approvedOutputForTask(bundle,t));
  if(pending.length) return {ok:false,reason:`${pending.length} task belum completed.`};
  const pendingReviews=(bundle.reviews||[]).filter(r=>String(r.review_status||'').toUpperCase()==='PENDING_REVIEW');
  if(pendingReviews.length) return {ok:false,reason:`${pendingReviews.length} review masih pending.`};
  return {ok:true,reason:'Semua task completed dan review approved.'};
}

function splitList(value){
  if(Array.isArray(value)) return value.map(x=>String(x||'').trim()).filter(Boolean);
  if(!value) return [];
  return String(value).split(/[,\n;|]+/).map(x=>x.trim()).filter(Boolean);
}
function slugKey(value){return String(value||'').toUpperCase().replace(/&/g,' AND ').replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'')||'GENERAL'}
const OFFICE_RH_INDUSTRY_REGISTRY={
  CONTRACTOR:{name:'General Contractor',keywords:['contractor','kontraktor','construction','pembinaan','bina','civil'],hero:'Penyelesaian kontraktor profesional untuk projek kediaman dan komersial.',about:'menyediakan perkhidmatan kontraktor yang tersusun, praktikal dan berorientasikan hasil untuk pelanggan kediaman, komersial dan organisasi.',trust:['Site visit','Experienced team','Clear quotation'],services:{renovation:'Kerja renovasi dan naik taraf ruang mengikut keperluan projek.',construction:'Kerja pembinaan asas dengan perancangan dan pelaksanaan yang kemas.',maintenance:'Penyelenggaraan bangunan untuk memastikan aset kekal berfungsi baik.'}},
  ELECTRICAL:{name:'Electrical Contractor',keywords:['electrical','elektrik','wiring','pendawaian','cable','power','db','maintenance'],hero:'Perkhidmatan elektrikal profesional untuk kediaman, komersial dan industri.',about:'membantu pelanggan mengurus kerja elektrikal dengan pendekatan selamat, kemas dan mengikut keperluan site.',trust:['Safety focused','Fast response','Experienced technician'],services:{wiring:'Kerja pendawaian untuk pemasangan baharu, baik pulih dan naik taraf sistem elektrik.',maintenance:'Pemeriksaan dan penyelenggaraan berkala untuk memastikan sistem elektrik selamat dan stabil.',cable_testing:'Ujian kabel bagi mengenal pasti risiko kerosakan dan tahap keselamatan sambungan.',db_installation:'Pemasangan dan naik taraf distribution board mengikut keperluan beban elektrik.'}},
  PLUMBING:{name:'Plumbing Services',keywords:['plumbing','paip','leak','bocor','sink','toilet','pipe'],hero:'Servis plumbing yang pantas, kemas dan boleh dipercayai.',about:'menyediakan kerja plumbing untuk rumah, premis perniagaan dan bangunan komersial dengan fokus kepada penyelesaian yang tahan lama.',trust:['Leak solution','Neat workmanship','Responsive support'],services:{pipe_repair:'Baik pulih paip bocor, tersumbat atau rosak.',toilet_repair:'Pembaikan sistem tandas, sinki dan saluran air.',installation:'Pemasangan paip, aksesori bilik air dan sistem saliran asas.'}},
  AIRCOND:{name:'Air Conditioning Services',keywords:['aircond','aircon','air conditioning','ac','penyaman udara','servis aircond'],hero:'Servis penyaman udara profesional untuk ruang yang lebih selesa.',about:'membantu pelanggan memastikan sistem penyaman udara berfungsi dengan sejuk, bersih dan cekap.',trust:['Clean service','Cooling performance','Scheduled maintenance'],services:{service_aircond:'Servis pembersihan dan penyelenggaraan aircond untuk prestasi lebih baik.',installation:'Pemasangan unit aircond mengikut kapasiti dan kesesuaian ruang.',repair:'Pemeriksaan dan pembaikan masalah aircond tidak sejuk, bocor atau berbunyi.'}},
  CLEANING:{name:'Cleaning Services',keywords:['cleaning','cuci','bersih','housekeeping','deep clean','sanitize'],hero:'Perkhidmatan pembersihan profesional untuk ruang yang bersih dan terurus.',about:'menyediakan solusi pembersihan untuk rumah, pejabat dan premis komersial dengan proses kerja yang teratur.',trust:['Trained cleaner','Flexible schedule','Quality control'],services:{deep_cleaning:'Pembersihan menyeluruh untuk ruang kediaman atau komersial.',office_cleaning:'Servis pembersihan pejabat secara berkala.',move_in_out:'Pembersihan sebelum masuk atau selepas keluar premis.'}},
  PRODUCT:{name:'Product / Ecommerce',keywords:['product','produk','ecommerce','kedai','shop','jualan','catalog'],hero:'Paparkan produk dengan lebih premium dan mudah dibeli.',about:'membantu jenama dan peniaga mempamerkan produk, kelebihan dan saluran pembelian secara lebih tersusun.',trust:['Product catalog','Easy enquiry','Clear offer'],services:{product_catalog:'Paparan katalog produk dengan susunan kategori yang jelas.',whatsapp_order:'Butang WhatsApp untuk pertanyaan dan tempahan pantas.',promotion:'Bahagian promosi untuk tawaran, pakej atau produk pilihan.'}},
  CLINIC:{name:'Clinic & Healthcare',keywords:['clinic','klinik','health','dental','medical','doctor','healthcare'],hero:'Maklumat klinik yang jelas, profesional dan mudah dihubungi.',about:'menyediakan maklumat perkhidmatan kesihatan, waktu operasi dan saluran temujanji dalam satu website yang kemas.',trust:['Professional care','Appointment ready','Clear information'],services:{consultation:'Maklumat konsultasi dan rawatan asas untuk pesakit.',appointment:'Saluran temujanji untuk memudahkan pelanggan membuat booking.',health_screening:'Penerangan ringkas pakej pemeriksaan kesihatan atau rawatan berkaitan.'}},
  RESTAURANT:{name:'Restaurant & F&B',keywords:['restaurant','restoran','cafe','food','makanan','fnb','katering'],hero:'Website F&B yang mempamerkan menu, lokasi dan tempahan dengan menarik.',about:'membantu pelanggan mengenali menu, suasana dan cara membuat tempahan atau pertanyaan dengan mudah.',trust:['Menu highlight','Easy booking','Location ready'],services:{menu:'Paparan menu pilihan dengan kategori yang mudah difahami.',catering:'Maklumat pakej katering atau tempahan berkumpulan.',reservation:'Saluran tempahan meja atau pertanyaan melalui WhatsApp.'}},
  REAL_ESTATE:{name:'Real Estate & Property',keywords:['real estate','property','hartanezah','hartanah','rumah','sale','rent','ejen'],hero:'Pamerkan hartanah dengan susun atur profesional dan mudah ditanya.',about:'membantu ejen dan pemilik hartanah mempamerkan listing, lokasi, manfaat dan saluran pertanyaan dengan jelas.',trust:['Listing highlight','Lead enquiry','Location info'],services:{property_listing:'Paparan listing hartanah dengan maklumat utama.',consultation:'Konsultasi jual, beli atau sewa hartanah.',viewing:'Saluran untuk booking sesi viewing atau pertanyaan lanjut.'}},
  DIGITAL_AGENCY:{name:'Digital Marketing Agency',keywords:['digital','agency','marketing','ads','seo','website','branding','social media'],hero:'Solusi digital untuk bantu bisnes tampil lebih profesional dan menjana lead.',about:'membantu bisnes membina kehadiran digital melalui strategi, kandungan, website dan kempen pemasaran.',trust:['Strategy driven','Creative execution','Lead focused'],services:{website:'Pembangunan website untuk profil bisnes, landing page atau kempen.',social_media:'Pengurusan kandungan media sosial untuk tingkatkan kredibiliti jenama.',ads:'Kempen iklan digital untuk capaian dan lead yang lebih tersasar.'}},
  EVENT_MANAGEMENT:{name:'Event Management',keywords:['event','majlis','wedding','corporate event','management','planner'],hero:'Urusan event yang lebih terancang, kemas dan berimpak.',about:'membantu pelanggan merancang dan melaksanakan majlis atau acara korporat dengan koordinasi yang teratur.',trust:['Event planning','Vendor coordination','On-site support'],services:{event_planning:'Perancangan konsep, flow dan keperluan acara.',coordination:'Koordinasi vendor, jadual dan operasi semasa event.',corporate_event:'Pengurusan acara korporat, pelancaran produk atau majlis rasmi.'}},
  CAR_RENTAL:{name:'Car Rental',keywords:['car rental','kereta sewa','rent car','rental car','mpv','van'],hero:'Sewa kereta yang mudah, fleksibel dan sesuai untuk perjalanan anda.',about:'menyediakan pilihan kenderaan sewaan untuk perjalanan harian, kerja, keluarga atau acara tertentu.',trust:['Flexible rental','Vehicle options','Easy booking'],services:{daily_rental:'Sewaan harian untuk kegunaan peribadi atau kerja.',mpv_rental:'Pilihan MPV untuk keluarga, rombongan atau perjalanan jauh.',chauffeur:'Pilihan pemandu mengikut ketersediaan dan keperluan tempahan.'}},
  EVENT_EQUIPMENT_RENTAL:{name:'Event Equipment Rental',keywords:['equipment rental','event equipment','pa system','canopy','kerusi','meja','rental peralatan'],hero:'Sewa peralatan event dengan susunan pakej yang jelas dan mudah ditempah.',about:'menyediakan peralatan majlis dan acara seperti khemah, meja, kerusi, sistem bunyi dan keperluan sokongan lain.',trust:['Package options','Setup support','Event ready'],services:{canopy:'Sewaan canopy untuk majlis, event korporat atau outdoor setup.',pa_system:'Sewaan PA system dan audio asas untuk acara.',table_chair:'Sewaan meja dan kerusi mengikut kuantiti dan susunan majlis.'}}
};
const OFFICE_RH_PACKAGE_RULES={
  PACKAGE_A:['hero','about','services','contact','whatsapp'],
  PACKAGE_B:['hero','about','services','gallery','faq','testimonials','contact','whatsapp'],
  PACKAGE_C:['hero','trust','about','services','portfolio','caseStudies','leadForm','contact','whatsapp'],
  PACKAGE_D:['hero','trust','about','services','productCatalog','booking','faq','portfolio','leadForm','contact','whatsapp']
};
const OFFICE_RH_TEMPLATE_RULES={
  BASIC_01:{name:'Basic Service Website',className:'tpl-basic-01',hero:'center',service:'cards',sectionLabel:'Simple Business'},
  BASIC_02:{name:'Modern Service Website',className:'tpl-basic-02',hero:'split',service:'feature',sectionLabel:'Modern Service'},
  CORPORATE_01:{name:'Corporate Premium Website',className:'tpl-corporate-01',hero:'corporate',service:'grid',sectionLabel:'Corporate Premium'},
  LANDING_01:{name:'Lead Generation Website',className:'tpl-landing-01',hero:'landing',service:'benefits',sectionLabel:'Lead Generation'},
  AGENCY_01:{name:'Creative Showcase Website',className:'tpl-agency-01',hero:'creative',service:'tiles',sectionLabel:'Creative Showcase'},
  CUSTOM:{name:'Custom Project',className:'tpl-corporate-01',hero:'custom',service:'grid',sectionLabel:'Custom Project'}
};
const OFFICE_RH_TEMPLATE_ALIASES={
  A01:'BASIC_01',
  A02:'CORPORATE_01',
  A03:'BASIC_02',
  B01:'CORPORATE_01',
  B02:'BASIC_02',
  B03:'BASIC_01',
  C01:'LANDING_01',
  C02:'CORPORATE_01',
  C03:'AGENCY_01',
  D01:'AGENCY_01',
  D02:'CORPORATE_01',
  D03:'LANDING_01',
  PRO_01:'LANDING_01',
  PRO_02:'CORPORATE_01',
  PRO_03:'AGENCY_01',
  BUSINESS_01:'LANDING_01',
  BUSINESS_02:'CORPORATE_01',
  BUSINESS_03:'AGENCY_01'
};
function normalizeTemplateCode(code){
  const raw=String(code||'BASIC_01').trim().toUpperCase();
  return OFFICE_RH_TEMPLATE_ALIASES[raw]||raw;
}
function templateDisplayName(code){
  const master=normalizeTemplateCode(code);
  return OFFICE_RH_TEMPLATE_RULES[master]?.name||String(code||'Template');
}
function detectIndustryKey(data){
  const hay=[data.business,data.company,...(data.services||[])].join(' ').toLowerCase();
  let best='CONTRACTOR', score=0;
  Object.entries(OFFICE_RH_INDUSTRY_REGISTRY).forEach(([key,ind])=>{
    const s=(ind.keywords||[]).reduce((n,k)=>n+(hay.includes(String(k).toLowerCase())?1:0),0);
    if(s>score){best=key; score=s;}
  });
  return best;
}
function servicePresetDescription(industry, label, location){
  const key=slugKey(label).toLowerCase();
  const services=industry.services||{};
  const exact=services[key];
  if(exact) return exact;
  const hit=Object.entries(services).find(([k])=>key.includes(k)||k.includes(key));
  if(hit) return hit[1];
  return `Kami menyediakan perkhidmatan ${label} yang disesuaikan mengikut keperluan pelanggan${location?' di '+location:''} dengan susunan kerja yang kemas dan profesional.`;
}
async function loadContentBankFromSupabase(industryKey){
  const empty={industry:null,services:[],faqs:[],ctas:[],trust:[]};
  try{
    if(window.OFFICE_RH_CONTENT_BANK_CACHE?.[industryKey]) return window.OFFICE_RH_CONTENT_BANK_CACHE[industryKey];
    const c=await db();
    const [indRes,svcRes,faqRes,ctaRes]=await Promise.all([
      c.from('content_industries').select('*').eq('industry_key',industryKey).eq('status','ACTIVE').maybeSingle(),
      c.from('content_services').select('*').eq('industry_key',industryKey).eq('status','ACTIVE').order('sort_order',{ascending:true}),
      c.from('content_faq').select('*').eq('industry_key',industryKey).eq('status','ACTIVE').order('sort_order',{ascending:true}),
      c.from('content_cta').select('*').eq('industry_key',industryKey).eq('status','ACTIVE').order('sort_order',{ascending:true})
    ]);
    const hasMissing=[indRes,svcRes,faqRes,ctaRes].some(r=>String(r.error?.message||'').includes('does not exist'));
    if(hasMissing) return empty;
    const bank={industry:indRes.data||null,services:svcRes.data||[],faqs:faqRes.data||[],ctas:ctaRes.data||[],trust:[]};
    window.OFFICE_RH_CONTENT_BANK_CACHE={...(window.OFFICE_RH_CONTENT_BANK_CACHE||{}),[industryKey]:bank};
    return bank;
  }catch(e){return empty;}
}
async function websiteDataFromBundle(bundle){
  const p=bundle.project||{}, c=p.office_clients||{}, i=bundle.intake||{};
  const company=c.company_name||i.company_name||c.client_name||p.project_name||'Client Website';
  const contact=c.client_name||i.client_name||company;
  const phone=c.phone||i.phone||'';
  const email=c.email||i.email||'';
  const business=c.business_type||i.business_type||'Business';
  const location=c.location||i.location||i.business_location||'';
  const services=splitList(i.services_requested);
  const packageCode=p.package_code||i.selected_package||'PACKAGE_A';
  const rawTemplateCode=p.template_code||i.selected_template||'BASIC_01';
  const templateCode=normalizeTemplateCode(rawTemplateCode);
  const draft={company,business,services};
  const detected=detectIndustryKey(draft);
  const industryKey=slugKey(i.industry_key||i.industry||detected);
  const fallbackIndustry=OFFICE_RH_INDUSTRY_REGISTRY[industryKey]||OFFICE_RH_INDUSTRY_REGISTRY[detected]||OFFICE_RH_INDUSTRY_REGISTRY.CONTRACTOR;
  const bank=await loadContentBankFromSupabase(industryKey);
  const industry={...fallbackIndustry,...(bank.industry?{name:bank.industry.industry_name||fallbackIndustry.name,hero:bank.industry.default_hero||fallbackIndustry.hero,about:bank.industry.default_about||fallbackIndustry.about}:{}),services:fallbackIndustry.services||{}};
  const serviceRows=services.length?services:['Company Profile','Contact Form','WhatsApp Integration'];
  const normalizedServices=serviceRows.map(label=>{
    const preset=(bank.services||[]).find(s=>slugKey(s.service_name)===slugKey(label)||slugKey(s.service_key)===slugKey(label));
    return {title:preset?.service_name||serviceLabel(label),description:preset?.description||servicePresetDescription(industry,serviceLabel(label),location),benefits:splitList(preset?.benefits)};
  });
  const faq=(bank.faqs||[]).length?bank.faqs.map(x=>({q:x.question,a:x.answer})).slice(0,6):[
    {q:'Bagaimana cara untuk dapatkan sebutharga?',a:'Hubungi kami melalui WhatsApp atau borang pertanyaan dan nyatakan keperluan anda.'},
    {q:'Kawasan servis meliputi di mana?',a:location?`Kami memberi tumpuan kepada pelanggan di ${location} dan kawasan sekitar.`:'Kawasan servis bergantung kepada jadual dan jenis permintaan.'},
    {q:'Boleh saya bincang dahulu sebelum membuat keputusan?',a:'Ya, anda boleh hubungi kami untuk semakan awal dan cadangan yang sesuai.'}
  ];
  const cta=(bank.ctas||[])[0]||{title:'Bincangkan keperluan anda dengan kami',description:'Dapatkan maklumat lanjut, cadangan servis dan anggaran langkah seterusnya.',button_text:'Hubungi Sekarang'};
  const objective=i.website_objective||industry.hero||'Website profesional yang jelas, responsif dan mudah dihubungi.';
  const requirement=i.additional_notes||i.website_requirements||'Website profesional dengan struktur yang kemas dan CTA yang jelas.';
  const colors=i.branding_colors||'Biru, putih dan emas';
  const template=OFFICE_RH_TEMPLATE_RULES[templateCode]||OFFICE_RH_TEMPLATE_RULES.BASIC_01;
  return {p,c,i,company,contact,phone,email,business,location,services:normalizedServices,objective,requirement,colors,template:templateCode,rawTemplate:rawTemplateCode,templateRule:template,package:packageCode,packageSections:OFFICE_RH_PACKAGE_RULES[packageCode]||OFFICE_RH_PACKAGE_RULES.PACKAGE_A,industryKey,industry,faq,cta,trust:industry.trust||[]};
}
function renderServices(items, variant='cards'){
  const rows=(items||[]).slice(0,6);
  if(variant==='compact') return rows.map((x,i)=>`<article class="service-row"><span>${String(i+1).padStart(2,'0')}</span><div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div></article>`).join('');
  if(variant==='benefits') return rows.map(x=>`<article class="benefit-card"><div class="check">✓</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></article>`).join('');
  if(variant==='showcase') return rows.map((x,i)=>`<article class="showcase-card"><div class="showcase-visual">${esc((x.title||'S').slice(0,1))}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><a href="#contact">Request Quote</a></article>`).join('');
  return rows.map(x=>`<article class="service-card"><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p>${x.benefits?.length?`<ul>${x.benefits.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}</article>`).join('')
}
function renderFaq(items){return `<section id="faq" class="section faq-section"><div class="section-kicker">FAQ</div><h2 class="section-title">Soalan Lazim</h2><div class="faq-list">${(items||[]).slice(0,6).map(x=>`<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}</div></section>`}
function renderPortfolio(d){return `<section id="portfolio" class="section portfolio-section"><div class="section-kicker">Portfolio</div><h2 class="section-title">Contoh skop kerja dan hasil yang boleh dipaparkan</h2><div class="portfolio-grid">${['Project Highlight','Before & After','Client Result'].map((x,i)=>`<article class="portfolio-card"><div class="portfolio-thumb">${esc(String(i+1).padStart(2,'0'))}</div><b>${esc(x)}</b><p>${esc(d.services[i]?.title||d.business)}</p></article>`).join('')}</div></section>`}
function renderLeadForm(d){return `<section id="lead" class="section lead-section"><div class="lead-box"><div><div class="section-kicker">Lead Form</div><h2 class="section-title">${esc(d.cta.title||'Dapatkan Sebutharga')}</h2><p>${esc(d.cta.description||'Isi maklumat ringkas dan team kami akan hubungi anda.')}</p></div><form class="contact-form"><input placeholder="Nama"><input placeholder="Telefon / WhatsApp"><input placeholder="Servis diperlukan"><textarea placeholder="Nyatakan keperluan anda"></textarea><button type="button">${esc(d.cta.button_text||'Hantar Pertanyaan')}</button></form></div></section>`}
function renderContact(d){return `<section id="contact" class="section contact-section"><div class="contact-wrap"><div><div class="section-kicker">Contact</div><h2 class="section-title">Hubungi ${esc(d.company)}</h2><p>${esc(d.cta.description||'Hubungi kami untuk perbincangan lanjut.')}</p><div class="contact-list"><p><b>Contact:</b> ${esc(d.contact)}</p><p><b>Telefon:</b> ${esc(d.phone||'-')}</p><p><b>Email:</b> ${esc(d.email||'-')}</p><p><b>Lokasi:</b> ${esc(d.location||'-')}</p></div></div><form class="contact-form"><input placeholder="Nama"><input placeholder="Email / Telefon"><textarea placeholder="Mesej"></textarea><button type="button">Hantar Pertanyaan</button></form></div></section>`}
function renderTrust(d){return `<div class="trust">${(d.trust.length?d.trust:['Professional Team','Clear Communication','Reliable Delivery']).slice(0,4).map(x=>`<div>${esc(x)}</div>`).join('')}</div>`}
function renderGallery(){return `<section id="gallery" class="section gallery-section"><div class="section-kicker">Gallery</div><h2 class="section-title">Galeri Visual</h2><div class="gallery-grid">${['Ruang kerja','Proses servis','Hasil kerja','Team support'].map(x=>`<div class="gallery-tile"><span>${esc(x)}</span></div>`).join('')}</div></section>`}
function renderTestimonials(){return `<section id="testimonials" class="section testimonial-section"><div class="section-kicker">Testimonial</div><h2 class="section-title">Dipercayai Pelanggan</h2><div class="grid"><article class="content-card"><p>“Servis kemas, mudah berurusan dan responsif.”</p><b>Client</b></article><article class="content-card"><p>“Maklumat jelas dan proses pertanyaan sangat mudah.”</p><b>Pelanggan</b></article><article class="content-card"><p>“Team profesional dan membantu dari awal hingga selesai.”</p><b>Customer</b></article></div></section>`}
function renderProductCatalog(d){return `<section id="catalog" class="section catalog-section"><div class="section-kicker">Catalog</div><h2 class="section-title">Produk / Pakej Pilihan</h2><div class="catalog-grid">${d.services.slice(0,4).map(x=>`<article class="catalog-card"><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><a class="mini-link" href="#contact">Tanya Pakej →</a></article>`).join('')}</div></section>`}
function renderBooking(){return `<section id="booking" class="section booking-section"><div class="booking-box"><h2>Booking / Tempahan</h2><p>Pilih tarikh, nyatakan keperluan dan team kami akan sahkan ketersediaan.</p><a class="cta" href="#contact">Book Sekarang</a></div></section>`}
function renderCaseStudies(){return `<section id="case-studies" class="section case-section"><div class="section-kicker">Case Study</div><h2 class="section-title">Masalah → Solusi → Hasil</h2><div class="case-flow"><div><b>01 Masalah</b><p>Keperluan pelanggan dikenal pasti dengan jelas.</p></div><div><b>02 Solusi</b><p>Cadangan kerja disusun mengikut skop dan keutamaan.</p></div><div><b>03 Hasil</b><p>Output akhir lebih kemas, mudah difahami dan bersedia untuk tindakan.</p></div></div></section>`}
function packageExtras(d){
  const sections=d.packageSections||[], has=x=>sections.includes(x);
  return [has('gallery')?renderGallery():'',has('productCatalog')?renderProductCatalog(d):'',has('portfolio')?renderPortfolio(d):'',has('caseStudies')?renderCaseStudies():'',has('booking')?renderBooking():'',has('faq')?renderFaq(d.faq):'',has('leadForm')?renderLeadForm(d):'',has('testimonials')?renderTestimonials():'' ].join('');
}
function productionStyle(){return `
:root{--primary:#0b5cff;--secondary:#00b894;--dark:#102033;--muted:#64748b;--bg:#f7fbff;--card:#ffffff;--line:#e2e8f0;--soft:#eff6ff;--radius:26px;--shadow:0 22px 70px rgba(15,32,58,.12)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,Arial,sans-serif;background:var(--bg);color:#172033;line-height:1.65}.site{overflow:hidden}.nav{position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;align-items:center;padding:18px 7vw;background:rgba(255,255,255,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.brand{font-weight:950;letter-spacing:.02em;color:var(--dark)}.nav a{color:var(--dark);text-decoration:none;margin-left:18px;font-weight:850}.hero{padding:86px 7vw}.hero h1{font-size:clamp(40px,7vw,82px);line-height:1.02;margin:0 0 20px;color:var(--dark);letter-spacing:-.05em}.hero p{font-size:20px;color:#475569;max-width:800px}.cta{display:inline-flex;align-items:center;gap:10px;margin-top:20px;padding:15px 24px;border-radius:999px;background:var(--primary);color:white;text-decoration:none;font-weight:950;box-shadow:0 18px 40px rgba(11,92,255,.22)}.badge,.section-kicker{display:inline-block;background:var(--soft);color:var(--primary);padding:8px 12px;border-radius:999px;font-weight:950;font-size:12px;text-transform:uppercase;letter-spacing:.08em}.section{padding:68px 7vw}.section-title{font-size:clamp(30px,4.4vw,50px);line-height:1.1;margin:0 0 14px;color:var(--dark);letter-spacing:-.035em}.grid,.services-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.content-card,.service-card,.benefit-card,.portfolio-card,.catalog-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:26px;box-shadow:var(--shadow)}.service-card h3,.benefit-card h3,.content-card h3,.catalog-card h3{margin-top:0;color:var(--primary)}.service-card ul{padding-left:18px}.hero-card,.floating-panel{background:rgba(255,255,255,.92);border:1px solid var(--line);border-radius:30px;padding:28px;box-shadow:var(--shadow)}.trust{padding:22px 7vw;background:var(--dark);color:white;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.trust div{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:16px;font-weight:900;text-align:center}.contact-wrap,.lead-box{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}.contact-form{display:grid;gap:12px;background:white;border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:var(--shadow)}.contact-form input,.contact-form textarea{width:100%;border:1px solid #dbe4ef;border-radius:14px;padding:14px;font:inherit}.contact-form textarea{min-height:130px}.contact-form button{border:0;border-radius:14px;padding:14px;background:var(--secondary);color:white;font-weight:950}.faq-list{display:grid;gap:12px}.faq-list details{background:white;border:1px solid var(--line);border-radius:18px;padding:18px}.faq-list summary{font-weight:950;cursor:pointer}.footer{padding:34px 7vw;background:var(--dark);color:#cbd5e1}.wa-float{position:fixed;right:22px;bottom:22px;background:#25d366;color:white;text-decoration:none;font-weight:950;border-radius:999px;padding:14px 20px;box-shadow:0 18px 40px rgba(37,211,102,.35);z-index:20}.gallery-grid,.portfolio-grid,.catalog-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.gallery-tile{min-height:180px;border-radius:28px;background:linear-gradient(135deg,var(--soft),#fff);border:1px solid var(--line);display:flex;align-items:end;padding:20px;font-weight:950;box-shadow:var(--shadow)}.portfolio-thumb{height:150px;border-radius:22px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:950;margin-bottom:18px}.mini-link{font-weight:950;color:var(--primary);text-decoration:none}.case-flow{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.case-flow>div,.booking-box{background:white;border:1px solid var(--line);border-radius:26px;padding:28px;box-shadow:var(--shadow)}.check{width:42px;height:42px;border-radius:999px;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:950}.service-row{display:grid;grid-template-columns:64px 1fr;gap:18px;padding:22px 0;border-bottom:1px solid var(--line)}.service-row span{font-size:28px;font-weight:950;color:var(--primary)}.showcase-card{background:#111827;color:white;border-radius:30px;padding:24px;min-height:270px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:var(--shadow)}.showcase-card p{color:#d1d5db}.showcase-card a{color:white;font-weight:950}.showcase-visual{width:74px;height:74px;border-radius:24px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:950}.contact-list p{margin:8px 0}
.tpl-basic-01{--primary:#0b5cff;--secondary:#00b894;--bg:#f8fbff;--soft:#eaf3ff}.tpl-basic-01 .hero{text-align:center;background:linear-gradient(135deg,#eaf3ff 0%,#fff 58%,#e8fff7 100%)}.tpl-basic-01 .hero-card{max-width:860px;margin:28px auto 0}.tpl-basic-01 .services-grid{max-width:1120px;margin:auto}.tpl-basic-01 .section{text-align:left}.tpl-basic-01 .about-simple{text-align:center;background:white}.tpl-basic-01 .about-simple .content-card{max-width:900px;margin:auto}
.tpl-basic-02{--primary:#14532d;--secondary:#f59e0b;--bg:#f8fafc;--soft:#dcfce7}.tpl-basic-02 .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:36px;align-items:center;background:radial-gradient(circle at top right,#dcfce7,transparent 35%),#f8fafc}.tpl-basic-02 .feature-stack{display:grid;gap:14px}.tpl-basic-02 .feature-pill{background:white;border:1px solid var(--line);border-radius:20px;padding:16px;font-weight:900;box-shadow:var(--shadow)}.tpl-basic-02 .services-modern{background:white}.tpl-basic-02 .benefit-card{min-height:220px}
.tpl-corporate-01{--primary:#1e3a8a;--secondary:#b7791f;--dark:#0f172a;--bg:#f1f5f9;--soft:#dbeafe}.tpl-corporate-01 .hero{display:grid;grid-template-columns:1.15fr .85fr;gap:38px;align-items:center;background:linear-gradient(120deg,#0f172a 0%,#1e3a8a 58%,#f8fafc 58%)}.tpl-corporate-01 .hero h1,.tpl-corporate-01 .hero p{color:white}.tpl-corporate-01 .badge{background:rgba(255,255,255,.14);color:#fff}.tpl-corporate-01 .corporate-about{background:white}.tpl-corporate-01 .corp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:22px}.tpl-corporate-01 .corp-stats div{background:#f8fafc;border:1px solid var(--line);border-radius:20px;padding:18px;font-weight:950}.tpl-corporate-01 .services-grid .service-card{border-top:5px solid var(--primary)}
.tpl-landing-01{--primary:#dc2626;--secondary:#111827;--bg:#fff7ed;--soft:#ffedd5;--dark:#111827}.tpl-landing-01 .nav{background:#111827}.tpl-landing-01 .brand,.tpl-landing-01 .nav a{color:white}.tpl-landing-01 .hero{text-align:center;background:linear-gradient(180deg,#fff7ed,#fff);padding-top:100px}.tpl-landing-01 .hero h1{max-width:950px;margin-left:auto;margin-right:auto}.tpl-landing-01 .hero p{margin-left:auto;margin-right:auto}.tpl-landing-01 .cta{font-size:18px;padding:18px 32px}.tpl-landing-01 .pain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.tpl-landing-01 .pain-card{background:white;border:1px solid #fed7aa;border-radius:24px;padding:24px;box-shadow:var(--shadow)}.tpl-landing-01 .lead-section{background:#111827;color:white}.tpl-landing-01 .lead-section .section-title,.tpl-landing-01 .lead-section p{color:white}
.tpl-agency-01{--primary:#7c3aed;--secondary:#06b6d4;--dark:#18122b;--bg:#fbf7ff;--soft:#ede9fe}.tpl-agency-01 .nav{background:rgba(24,18,43,.88)}.tpl-agency-01 .brand,.tpl-agency-01 .nav a{color:white}.tpl-agency-01 .hero{display:grid;grid-template-columns:.95fr 1.05fr;gap:34px;align-items:center;background:radial-gradient(circle at 20% 20%,#ddd6fe,transparent 28%),radial-gradient(circle at 80% 10%,#cffafe,transparent 25%),#fbf7ff}.tpl-agency-01 .creative-board{display:grid;grid-template-columns:1fr 1fr;gap:16px;transform:rotate(-1deg)}.tpl-agency-01 .creative-board div{min-height:150px;border-radius:28px;background:linear-gradient(135deg,var(--primary),var(--secondary));box-shadow:var(--shadow)}.tpl-agency-01 .creative-board div:nth-child(2){margin-top:40px;background:linear-gradient(135deg,#111827,var(--primary))}.tpl-agency-01 .creative-board div:nth-child(3){background:linear-gradient(135deg,var(--secondary),#fff)}.tpl-agency-01 .services-grid{grid-template-columns:repeat(3,1fr)}.tpl-agency-01 .showcase-card:nth-child(even){transform:translateY(24px)}
@media(max-width:900px){.hero,.contact-wrap,.lead-box,.tpl-basic-02 .hero,.tpl-corporate-01 .hero,.tpl-agency-01 .hero{grid-template-columns:1fr}.grid,.services-grid,.trust,.gallery-grid,.portfolio-grid,.catalog-grid,.case-flow,.pain-grid{grid-template-columns:1fr}.nav{align-items:flex-start;gap:10px;flex-direction:column}.hero{padding-top:54px}.tpl-corporate-01 .hero{background:#0f172a}.tpl-agency-01 .creative-board{transform:none}.tpl-agency-01 .showcase-card:nth-child(even){transform:none}}
`}
function renderBaseHead(d){return `<nav class="nav"><div class="brand">${esc(d.company)}</div><div><a href="#about">Tentang</a><a href="#services">Servis</a><a href="#contact">Hubungi</a></div></nav>`}
function renderBasic01(d){return `${renderBaseHead(d)}<header class="hero"><span class="badge">${esc(d.templateRule.name)} · ${esc(d.industry.name)}</span><h1>${esc(d.company)}</h1><p>${esc(d.industry.hero||d.objective)}</p><a class="cta" href="#contact">${esc(d.cta.button_text||'Hubungi Sekarang')}</a><aside class="hero-card"><h2>${esc(d.business)}</h2><p>${esc(d.requirement||'Perkhidmatan utama disusun dalam website yang ringkas dan mudah difahami.')}</p></aside></header><section id="about" class="section about-simple"><div class="section-kicker">Tentang Kami</div><h2 class="section-title">Servis profesional yang mudah dihubungi</h2><div class="content-card"><p>${esc(d.company)} ${esc(d.industry.about)}</p></div></section><section id="services" class="section"><div class="section-kicker">Servis</div><h2 class="section-title">Perkhidmatan Utama</h2><div class="services-grid">${renderServices(d.services)}</div></section>${packageExtras(d)}${renderContact(d)}`}
function renderBasic02(d){return `${renderBaseHead(d)}<header class="hero"><div><span class="badge">Modern Service · ${esc(d.package)}</span><h1>${esc(d.company)}</h1><p>${esc(d.industry.hero||d.objective)}</p><a class="cta" href="#contact">Minta Sebutharga</a></div><aside class="feature-stack">${(d.trust.length?d.trust:['Fast Response','Clear Scope','Professional Support']).slice(0,4).map(x=>`<div class="feature-pill">${esc(x)}</div>`).join('')}</aside></header><section id="about" class="section"><div class="section-kicker">Kenapa Kami</div><h2 class="section-title">Penyelesaian servis yang tersusun</h2><div class="content-card"><p>${esc(d.company)} ${esc(d.industry.about)}</p></div></section><section id="services" class="section services-modern"><div class="section-kicker">Benefits</div><h2 class="section-title">Apa yang pelanggan dapat</h2><div class="services-grid">${renderServices(d.services,'benefits')}</div></section>${packageExtras(d)}${renderContact(d)}`}
function renderCorporate01(d){return `${renderBaseHead(d)}<header class="hero"><div><span class="badge">Corporate Premium · ${esc(d.industry.name)}</span><h1>${esc(d.company)}</h1><p>${esc(d.industry.hero||d.objective)}</p><a class="cta" href="#contact">Discuss Project</a></div><aside class="hero-card"><h2>Company Snapshot</h2><p><b>Industry:</b> ${esc(d.business)}</p><p><b>Location:</b> ${esc(d.location||'-')}</p><p><b>Package:</b> ${esc(d.package)}</p></aside></header>${renderTrust(d)}<section id="about" class="section corporate-about"><div class="section-kicker">Company Profile</div><h2 class="section-title">Tentang ${esc(d.company)}</h2><p>${esc(d.company)} ${esc(d.industry.about)}</p><div class="corp-stats"><div>Professional Operation</div><div>Structured Service</div><div>Client Ready</div></div></section><section id="services" class="section"><div class="section-kicker">Core Services</div><h2 class="section-title">Skop Perkhidmatan</h2><div class="services-grid">${renderServices(d.services)}</div></section>${packageExtras(d)}${renderContact(d)}`}
function renderLanding01(d){return `${renderBaseHead(d)}<header class="hero"><span class="badge">Lead Generation · ${esc(d.industry.name)}</span><h1>${esc(d.industry.hero||d.company)}</h1><p>${esc(d.cta.description||d.objective)}</p><a class="cta" href="#lead">${esc(d.cta.button_text||'Dapatkan Tawaran')}</a></header><section class="section"><div class="section-kicker">Masalah Pelanggan</div><h2 class="section-title">Buat keputusan lebih cepat dengan maklumat yang jelas</h2><div class="pain-grid"><div class="pain-card"><b>Susah banding servis</b><p>Maklumat utama disusun supaya pelanggan faham skop dengan cepat.</p></div><div class="pain-card"><b>Lambat dapat respon</b><p>CTA dan WhatsApp diletakkan jelas untuk tindakan segera.</p></div><div class="pain-card"><b>Kurang keyakinan</b><p>FAQ, manfaat dan testimoni membantu bina kepercayaan.</p></div></div></section><section id="services" class="section"><div class="section-kicker">Benefits</div><h2 class="section-title">Apa yang ditawarkan</h2><div class="services-grid">${renderServices(d.services,'benefits')}</div></section>${packageExtras(d)}${renderContact(d)}`}
function renderAgency01(d){return `${renderBaseHead(d)}<header class="hero"><div><span class="badge">Creative Showcase · ${esc(d.industry.name)}</span><h1>${esc(d.company)}</h1><p>${esc(d.industry.hero||d.objective)}</p><a class="cta" href="#catalog">Explore Package</a></div><aside class="creative-board"><div></div><div></div><div></div><div></div></aside></header><section id="about" class="section"><div class="section-kicker">Showcase</div><h2 class="section-title">Visual, pakej dan pertanyaan dalam satu aliran</h2><div class="content-card"><p>${esc(d.company)} ${esc(d.industry.about)}</p></div></section><section id="services" class="section"><div class="section-kicker">Featured</div><h2 class="section-title">Servis / Pakej Pilihan</h2><div class="services-grid">${renderServices(d.services,'showcase')}</div></section>${packageExtras(d)}${renderContact(d)}`}
async function buildPreviewHtml(bundle){
  const d=await websiteDataFromBundle(bundle); const year=new Date().getFullYear();
  const renderer={BASIC_01:renderBasic01,BASIC_02:renderBasic02,CORPORATE_01:renderCorporate01,LANDING_01:renderLanding01,AGENCY_01:renderAgency01,CUSTOM:renderCorporate01}[d.template]||renderBasic01;
  const body=renderer(d);
  return `<!doctype html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.company)} | ${esc(d.business)}</title><meta name="description" content="${esc(d.objective)}"><style>${productionStyle()}</style></head><body class="${esc(d.templateRule.className)}"><div class="site">${body}<footer class="footer">© ${year} ${esc(d.company)}. Website generated by OFFICE RH v1.4.1. Project: ${esc(d.p.project_code||'')}</footer>${d.phone?`<a class="wa-float" href="https://wa.me/${String(d.phone||'').replace(/\D/g,'')}" target="_blank">WhatsApp</a>`:''}<script>${buildProductionJs()}</script></div></body></html>`;
}

function buildProductionCss(){return productionStyle()}
function buildProductionJs(){return `document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}}));`;}

async function ensureFinalProduction(projectId,status='READY_FOR_PREVIEW'){
  const c=await db();
  const {data:existing,error:e}=await c.from('office_final_production').select('*').eq('project_id',projectId).order('created_at',{ascending:false}).limit(1);
  if(e) throw e;
  const docUrl='preview.html?project_id='+encodeURIComponent(projectId);
  if((existing||[]).length){
    const row=existing[0];
    await c.from('office_final_production').update({production_status:status,documentation_url:docUrl}).eq('production_id',row.production_id);
    return {...row,production_status:status,documentation_url:docUrl};
  }
  const {data,error}=await c.from('office_final_production').insert({project_id:projectId,production_status:status,documentation_url:docUrl}).select().single();
  if(error) throw error; return data;
}
async function buildProductionPreview(projectId){ return generateWebsite(projectId); }
async function productionPreview(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('preview.html','Client Preview','Preview HTML production sebenar sebelum dihantar kepada client');
  const projectId=new URLSearchParams(location.search).get('project_id')||new URLSearchParams(location.search).get('id');
  if(!projectId){$('#app').innerHTML='<div class="card"><p class="muted">Project ID tiada.</p></div>';return;}
  try{
    const bundle=await getProjectBundle(projectId);
    const html=await buildPreviewHtml(bundle);
    const url=URL.createObjectURL(new Blob([html],{type:'text/html'}));
    $('#app').innerHTML=`<div class="card"><div class="toolbar"><a class="btn" href="${url}" target="_blank">Open Full Preview</a><button class="btn success" onclick="clientApproveProject('${projectId}')">Client Approve</button><button class="btn warn" onclick="clientRevisionProject('${projectId}')">Request Revision</button><button class="btn secondary" onclick="downloadFinalZip('${projectId}')">Generate ZIP</button></div><p class="muted">Preview ini dibina daripada output department yang telah approved.</p></div><iframe title="Client Preview" src="${url}" style="width:100%;height:720px;border:1px solid rgba(255,255,255,.15);border-radius:24px;background:white;margin-top:16px"></iframe>`;
  }catch(e){toast(e.message||e,'error')}
}
async function clientApproveProject(projectId){
  const c=await db();
  try{await ensureFinalProduction(projectId,'CLIENT_APPROVED'); await c.from('office_projects').update({project_status:'CLIENT_APPROVED'}).eq('project_id',projectId); toast('Client approval direkodkan.','ok'); setTimeout(()=>location.href='final-production.html',700)}catch(e){toast(e.message||e,'error')}
}
async function clientRevisionProject(projectId){
  const note=prompt('Catatan revision client:'); if(!note)return;
  const c=await db();
  try{await ensureFinalProduction(projectId,'REVISION_REQUESTED'); await c.from('office_projects').update({project_status:'REVISION_REQUESTED'}).eq('project_id',projectId); toast('Revision request direkodkan. Buat task pembaikan kepada department berkaitan.','ok')}catch(e){toast(e.message||e,'error')}
}
async function loadJSZip(){
  if(window.JSZip) return window.JSZip;
  return new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';s.onload=()=>res(window.JSZip);s.onerror=()=>rej(new Error('Gagal load JSZip CDN.'));document.head.appendChild(s)});
}
async function downloadFinalZip(projectId){
  try{
    const JSZip=await loadJSZip(); const bundle=await getProjectBundle(projectId); const gate=projectCompletionGate(bundle);
    if(!gate.ok) return toast('ZIP belum boleh dijana: '+gate.reason,'error');
    const final=(bundle.finals||[])[0]; const st=String(final?.production_status||'').toUpperCase();
    if(!['CLIENT_APPROVED','READY_FOR_DELIVERY','DELIVERED'].includes(st)) return toast('Perlu Client Approve sebelum generate final ZIP.','error');
    const p=bundle.project, client=p.office_clients||{}; const d=await websiteDataFromBundle(bundle); const code=p.project_code||projectId; const safe=String(client.company_name||client.client_name||p.project_name||'client').replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'');
    const html=(await buildPreviewHtml(bundle)).replace(`<style>${productionStyle()}</style>`,`<link rel="stylesheet" href="assets/css/style.css">`).replace(/<script>[\s\S]*?<\/script><\/body>/,`<script src="assets/js/script.js"></script></body>`);
    const zip=new JSZip();
    zip.file('index.html',html);
    zip.file('assets/css/style.css',buildProductionCss());
    zip.file('assets/js/script.js',buildProductionJs());
    zip.file('docs/README.txt',`OFFICE RH Final Delivery\nProject: ${p.project_name}\nCode: ${code}\nClient: ${client.company_name||client.client_name||''}\nPackage: ${d.package}\nTemplate: ${d.template}\nVersion: v1.0\nGenerated: ${new Date().toISOString()}\n\nOpen index.html to preview the website. Upload all files to your hosting public_html/www directory.\n`);
    zip.file('docs/scope.txt',`Client: ${d.company}\nBusiness: ${d.business}\nPackage: ${d.package}\nTemplate: ${d.template}\nServices: ${(d.services||[]).map(serviceLabel).join(', ')}\nObjective: ${d.objective}\nRequirement: ${d.requirement}\nBranding: ${d.colors}\n`);
    zip.file('outputs/project.json',JSON.stringify({project:p,intake:bundle.intake,client,generated_at:new Date().toISOString()},null,2));
    zip.file('outputs/department_outputs.json',JSON.stringify(bundle.outputs,null,2));
    zip.file('outputs/tasks.json',JSON.stringify(bundle.tasks,null,2));
    const blob=await zip.generateAsync({type:'blob'}); const filename=`${code}_${safe}_v1.0.zip`; const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
    const c=await db(); if(final?.production_id) await c.from('office_final_production').update({production_status:'READY_FOR_DELIVERY',final_package_url:filename}).eq('production_id',final.production_id);
    toast('Final ZIP website sebenar dijana dan direkodkan.','ok'); setTimeout(()=>location.reload(),900);
  }catch(e){toast(e.message||e,'error')}
}

async function deliverCompleted(projectId,productionId){
  const ok=confirm('Sahkan file ZIP sudah dihantar kepada client dan project boleh ditutup?'); if(!ok)return;
  const c=await db();
  await c.from('office_final_production').update({production_status:'DELIVERED',delivered_at:new Date().toISOString()}).eq('production_id',productionId);
  const {data:ex}=await c.from('office_completed_projects').select('completed_id').eq('project_id',projectId).limit(1);
  if(!(ex||[]).length) await c.from('office_completed_projects').insert({project_id:projectId,version:'v1.0',archive_status:'DELIVERED'});
  await c.from('office_projects').update({project_status:'COMPLETED'}).eq('project_id',projectId);
  location.href='completed-projects.html';
}
async function dashboard(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('dashboard.html','Office RH Command Center','Pantau intake, production, task, review dan delivery dalam satu skrin.');
  const c=auth.c;
  const [intakesRes,clientsRes,projectsRes,tasksRes,reviewsRes,completedRes,finalRes]=await Promise.all([
    c.from('office_project_intakes').select('intake_id,client_name,company_name,phone,selected_package,status,created_at').order('created_at',{ascending:false}).limit(8),
    c.from('office_clients').select('client_id',{count:'exact',head:true}),
    c.from('office_projects').select('project_id,project_code,project_name,package_code,project_status,created_at,office_clients(client_name,company_name)').order('created_at',{ascending:false}).limit(200),
    c.from('office_tasks').select('task_id,task_title,task_status,created_at,office_projects(project_name,project_code),office_departments(department_name)').order('created_at',{ascending:false}).limit(200),
    c.from('office_reviews').select('review_id,review_status,review_comment,reviewed_at,output_id,office_department_outputs(project_id,output_content,output_status)').order('reviewed_at',{ascending:false}).limit(100),
    c.from('office_completed_projects').select('completed_id,created_at,office_projects(project_name,project_code)').order('created_at',{ascending:false}).limit(100),
    c.from('office_final_production').select('production_id,production_status,created_at,office_projects(project_name,project_code)').order('created_at',{ascending:false}).limit(50)
  ]);
  const errors=[intakesRes,clientsRes,projectsRes,tasksRes,reviewsRes,completedRes,finalRes].filter(x=>x.error).map(x=>x.error.message);
  if(errors.length) toast('Dashboard data warning: '+errors.join(' | '),'error');
  const intakes=intakesRes.data||[], projects=projectsRes.data||[], tasks=tasksRes.data||[], reviews=reviewsRes.data||[], completed=completedRes.data||[], finals=finalRes.data||[];
  const clientsCount=clientsRes.count||0;
  const newIntakes=dashStatusCount(intakes,'status','INTAKE_SUBMITTED');
  const activeProjects=dashOpenCount(projects,'project_status',['COMPLETED','CANCELLED','ARCHIVED']);
  const activeTasks=dashOpenCount(tasks,'task_status',['DONE','COMPLETED','APPROVED','CANCELLED']);
  const pendingReviews=dashStatusCount(reviews,'review_status','PENDING_REVIEW');
  const projectStatuses=['PROJECT_CREATED','IN_PROGRESS','PENDING_REVIEW','REVISION_REQUIRED','COMPLETED'];
  const taskStatuses=['PENDING','IN_PROGRESS','PENDING_REVIEW','REVISION_REQUIRED','APPROVED','COMPLETED'];
  window.OFFICE_RH_DASHBOARD_METRICS={activeTasks,pendingReviews,production:finals.length,activeProjects};
  const intakeRows=intakes.map(r=>`<tr><td><b>${esc(r.company_name||r.client_name||'-')}</b><br><span class="muted">${esc(r.client_name||'')} ${esc(r.phone||'')}</span></td><td>${esc(r.selected_package||'-')}</td><td><span class="pill orange">${esc(r.status||'-')}</span></td><td>${fmt(r.created_at)}</td><td><a class="btn secondary" href="intakes.html">Open</a></td></tr>`).join('');
  const urgentRows=tasks.filter(t=>!['DONE','COMPLETED','APPROVED','CANCELLED'].includes(String(t.task_status||'').toUpperCase())).slice(0,6).map(t=>`<tr><td><b>${esc(t.office_projects?.project_name||'-')}</b><br><span class="muted">${esc(t.office_projects?.project_code||'')}</span></td><td>${esc(t.office_departments?.department_name||'-')}</td><td>${esc(t.task_title||'-')}</td><td><span class="pill orange">${esc(t.task_status||'-')}</span></td></tr>`).join('');
  const reviewRows=reviews.filter(r=>String(r.review_status||'').toUpperCase()==='PENDING_REVIEW').slice(0,5).map(r=>`<tr><td><div class="mono dash-output">${esc(outputText(r.office_department_outputs?.output_content))}</div></td><td><span class="pill orange">${esc(r.review_status||'-')}</span></td><td><a class="btn secondary" href="reviews.html">Review</a></td></tr>`).join('');
  const finalRows=finals.slice(0,5).map(r=>`<tr><td><b>${esc(r.office_projects?.project_name||'-')}</b><br><span class="muted">${esc(r.office_projects?.project_code||'')}</span></td><td><span class="pill green">${esc(r.production_status||'-')}</span></td><td>${fmt(r.created_at)}</td></tr>`).join('');
  $('#app').innerHTML=`
    <div class="dash-actions"><a class="btn gold" href="project-intake.html" target="_blank">+ New Intake</a><a class="btn secondary" href="intakes.html">Open Intakes</a><a class="btn secondary" href="projects.html">Open Projects</a><a class="btn secondary" href="tasks.html">Open Tasks</a><a class="btn secondary" href="reviews.html">Open Reviews</a></div>
    <div class="card aira-briefing-card"><div class="aira-core"><b>AIRA</b><span>Online</span></div><div><h3>AI Assistant Briefing</h3><p class="muted">Dashboard greeting dimainkan selepas dashboard siap load, bukan di login screen.</p><div class="briefing-metrics"><span>Tasks <b>${activeTasks}</b></span><span>Reviews <b>${pendingReviews}</b></span><span>Production <b>${finals.length}</b></span><span>Projects <b>${activeProjects}</b></span></div></div><button class="btn secondary" onclick="playDashboardGreeting(true, window.OFFICE_RH_DASHBOARD_METRICS||{})">Replay Briefing</button></div>
    <div class="grid cols4 dash-kpi"><div class="card"><div class="label">New Intakes</div><div class="metric">${newIntakes}</div><p class="muted">${intakes.length} latest records loaded</p></div><div class="card"><div class="label">Active Projects</div><div class="metric">${activeProjects}</div><p class="muted">${projects.length} projects tracked</p></div><div class="card"><div class="label">Active Tasks</div><div class="metric">${activeTasks}</div><p class="muted">Pending production work</p></div><div class="card"><div class="label">Pending Reviews</div><div class="metric">${pendingReviews}</div><p class="muted">Need approval/revision</p></div></div>
    <div class="grid cols2 dash-section"><div class="card"><h3>Production Pipeline</h3><div class="pipeline"><div><b>Lead</b><span>${intakes.length}</span></div><div><b>Intake</b><span>${newIntakes}</span></div><div><b>Production</b><span>${activeProjects}</span></div><div><b>Review</b><span>${pendingReviews}</span></div><div><b>Completed</b><span>${completed.length}</span></div></div><p class="muted">Services RH → AIRA AI → Lead → Admin WhatsApp → Project Intake Form → Office RH → Production → Completed</p></div><div class="card"><h3>Client & Delivery</h3><div class="grid cols3"><div><div class="label">Clients</div><div class="metric">${clientsCount}</div></div><div><div class="label">Completed</div><div class="metric">${completed.length}</div></div><div><div class="label">Final Production</div><div class="metric">${finals.length}</div></div></div></div></div>
    <div class="grid cols2 dash-section"><div class="card"><h3>Project Status</h3><div class="status-grid">${projectStatuses.map(s=>`<div><span>${esc(s)}</span><b>${dashStatusCount(projects,'project_status',s)}</b></div>`).join('')}</div></div><div class="card"><h3>Task Status</h3><div class="status-grid">${taskStatuses.map(s=>`<div><span>${esc(s)}</span><b>${dashStatusCount(tasks,'task_status',s)}</b></div>`).join('')}</div></div></div>
    <div class="card dash-section"><h3>Urgent / Open Tasks</h3>${urgentRows?`<div class="table-wrap"><table><thead><tr><th>Project</th><th>Department</th><th>Task</th><th>Status</th></tr></thead><tbody>${urgentRows}</tbody></table></div>`:dashEmpty('Tiada task terbuka.')}</div>
    <div class="grid cols2 dash-section"><div class="card"><h3>Recent Intakes</h3>${intakeRows?`<div class="table-wrap"><table><thead><tr><th>Client</th><th>Package</th><th>Status</th><th>Submitted</th><th></th></tr></thead><tbody>${intakeRows}</tbody></table></div>`:dashEmpty('Belum ada intake.')}</div><div class="card"><h3>Notifications</h3><div class="notice-list"><a href="reviews.html">${pendingReviews} review menunggu keputusan</a><a href="tasks.html">${activeTasks} task masih terbuka</a><a href="intakes.html">${newIntakes} intake baru perlu diproses</a><a href="final-production.html">${finals.length} item final production</a></div></div></div>
    <div class="grid cols2 dash-section"><div class="card"><h3>Pending Review Queue</h3>${reviewRows?`<div class="table-wrap"><table><thead><tr><th>Output</th><th>Status</th><th>Action</th></tr></thead><tbody>${reviewRows}</tbody></table></div>`:dashEmpty('Tiada review pending.')}</div><div class="card"><h3>Final Production Latest</h3>${finalRows?`<div class="table-wrap"><table><thead><tr><th>Project</th><th>Status</th><th>Created</th></tr></thead><tbody>${finalRows}</tbody></table></div>`:dashEmpty('Belum ada final production.')}</div></div>
    <div class="card dash-section"><h3>System Health</h3><div class="health-grid"><div><span>Supabase Auth</span><b>Connected</b></div><div><span>Admin Session</span><b>${esc(auth.admin?.role||'Active')}</b></div><div><span>Frontend</span><b>${esc(window.OFFICE_RH_VERSION?.version||'Live')}</b></div><div><span>Cache Policy</span><b>Service Worker Network First</b></div></div></div>`;
  setTimeout(()=>playDashboardGreeting(false, window.OFFICE_RH_DASHBOARD_METRICS||{}),900);
}

function serviceLabel(v){
  const map={company_profile:'Company Profile',landing_page:'Landing Page',product_catalog:'Product Catalog',blog:'Blog',appointment_booking:'Appointment Booking',contact_form:'Contact Form',whatsapp_integration:'WhatsApp Integration',google_maps:'Google Maps',ecommerce:'Ecommerce',payment_gateway:'Payment Gateway',member_login:'Member Login',customer_portal:'Customer Portal',seo_setup:'SEO Setup',multi_language:'Multi Language',custom_function:'Custom Function'};
  return map[v]||String(v||'-').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
}
async function publicIntake(){
  const c=await db();
  const pkgSel=$('#selected_package'), tplSel=$('#selected_template');
  let packages=[], templates=[];
  const DEFAULT_TEMPLATES_BY_PACKAGE={
    PACKAGE_A:[
      {template_code:'BASIC_01',template_name:'Basic Service Website'},
      {template_code:'BASIC_02',template_name:'Modern Service Website'},
      {template_code:'CORPORATE_01',template_name:'Corporate Profile Website'}
    ],
    PACKAGE_B:[
      {template_code:'BASIC_02',template_name:'Modern Service Website'},
      {template_code:'CORPORATE_01',template_name:'Corporate Service Website'},
      {template_code:'AGENCY_01',template_name:'Creative Showcase Website'}
    ],
    PACKAGE_C:[
      {template_code:'LANDING_01',template_name:'Lead Generation Website'},
      {template_code:'CORPORATE_01',template_name:'Corporate Premium Website'},
      {template_code:'AGENCY_01',template_name:'Portfolio / Agency Website'}
    ],
    PACKAGE_D:[
      {template_code:'AGENCY_01',template_name:'Creative Catalog & Booking Website'},
      {template_code:'LANDING_01',template_name:'Rental / Booking Landing Website'},
      {template_code:'CORPORATE_01',template_name:'Premium Business Website'}
    ],
    PACKAGE_E:[
      {template_code:'CUSTOM',template_name:'Custom Project'}
    ]
  };

  const WEBSITE_OBJECTIVE_OPTIONS=[
    {value:'company_profile',title:'Company Profile',desc:'Profil syarikat, kredibiliti dan maklumat servis.'},
    {value:'lead_generation',title:'Lead Generation',desc:'Dapatkan prospek melalui WhatsApp atau borang.'},
    {value:'product_showcase',title:'Product Showcase',desc:'Pamer produk atau servis utama dengan CTA.'},
    {value:'booking_system',title:'Booking System',desc:'Tempahan servis, appointment atau slot masa.'},
    {value:'rental_website',title:'Rental Website',desc:'Sewaan kereta, alat event atau equipment.'},
    {value:'portfolio_website',title:'Portfolio Website',desc:'Pamer projek, hasil kerja atau case study.'},
    {value:'event_promotion',title:'Event Promotion',desc:'Promosi event, program atau kempen.'},
    {value:'custom',title:'Custom',desc:'Keperluan khas yang akan diterangkan dalam catatan.'}
  ];
  const DESIGN_STYLE_OPTIONS=[
    {value:'minimal',title:'Minimal',desc:'Bersih, ringkas dan profesional.'},
    {value:'corporate',title:'Corporate',desc:'Formal, premium dan dipercayai.'},
    {value:'modern',title:'Modern',desc:'Moden, dinamik dan kemas.'},
    {value:'creative',title:'Creative',desc:'Visual kuat, sesuai portfolio dan agency.'},
    {value:'conversion',title:'Conversion',desc:'CTA kuat, fokus leads dan jualan.'},
    {value:'premium',title:'Premium',desc:'Eksklusif, elegan dan high-value.'}
  ];

  function fallbackOptions(){
    packages=[
      {package_code:'PACKAGE_A',package_name:'Basic'},
      {package_code:'PACKAGE_B',package_name:'Standard'},
      {package_code:'PACKAGE_C',package_name:'Pro'},
      {package_code:'PACKAGE_D',package_name:'Business'},
      {package_code:'PACKAGE_E',package_name:'Custom'}
    ];
    templates=Object.entries(DEFAULT_TEMPLATES_BY_PACKAGE).flatMap(([package_code,rows])=>rows.map(t=>({...t,package_code})));
  }
  function setChoiceSummary(type, value, label){
    const el=$(`#${type}_summary`);
    if(el){
      const emptyMap={selected_package:'Belum pilih package',selected_template:'Belum pilih template',website_objective:'Belum pilih objektif',design_style:'Belum pilih gaya design'};
      el.textContent=value ? `Dipilih: ${label||value}` : (emptyMap[type]||'Belum pilih');
    }
  }
  function renderChoicePanel(type, rows, getValue, getTitle, getDesc){
    const select=$(`#${type}`), panel=$(`#${type}_picker`);
    if(!select || !panel) return;
    if(!rows.length){
      panel.innerHTML='<div class="choice-empty">Tiada pilihan tersedia. Sila hubungi admin Restu Harmoni.</div>';
      setChoiceSummary(type,'','');
      return;
    }
    panel.innerHTML=rows.map((row,idx)=>{
      const value=getValue(row), title=getTitle(row), desc=getDesc(row);
      const active=String(select.value||'')===String(value||'')?' active':'';
      const id=`${type}_${String(value||idx).replace(/[^a-z0-9_-]/gi,'_')}`;
      return `<label class="choice-card${active}" for="${esc(id)}" data-choice-type="${esc(type)}" data-choice-value="${esc(value)}"><input id="${esc(id)}" type="radio" name="${esc(type)}_radio" value="${esc(value)}" ${active?'checked':''}><span class="choice-radio"></span><span class="choice-text"><b>${esc(title)}</b><em>${esc(desc||'')}</em></span></label>`;
    }).join('');
    const selected=rows.find(r=>String(getValue(r))===String(select.value||''));
    setChoiceSummary(type, select.value, selected?getTitle(selected):select.value);
    panel.querySelectorAll('.choice-card').forEach(btn=>btn.addEventListener('click',()=>{
      select.value=btn.dataset.choiceValue||'';
      const radio=btn.querySelector('input[type=radio]');
      if(radio) radio.checked=true;
      select.dispatchEvent(new Event('change',{bubbles:true}));
      panel.querySelectorAll('.choice-card').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      setChoiceSummary(type, select.value, btn.querySelector('b')?.textContent||select.value);
    }));
  }
  function renderPackageOptions(){
    if(!pkgSel) return;
    pkgSel.innerHTML='<option value="">Pilih package</option>'+packages.map(p=>`<option value="${esc(p.package_code)}">${esc(p.package_code)} — ${esc(p.package_name||'')}</option>`).join('');
    renderChoicePanel('selected_package',packages,p=>p.package_code,p=>`${p.package_code} — ${p.package_name||''}`,p=>p.description||'Pilih package ini untuk skop projek.');
  }
  function renderTemplateOptions(){
    if(!tplSel) return;
    const selectedPackage=pkgSel?.value||'';
    const pkg=packages.find(p=>p.package_code===selectedPackage);
    let rows=templates.filter(t=>{
      if(!selectedPackage) return true;
      if(t.package_code && String(t.package_code)===String(selectedPackage)) return true;
      if(pkg?.package_id && t.package_id && String(t.package_id)===String(pkg.package_id)) return true;
      return false;
    });
    const seenTemplates=new Set();
    rows=rows.filter(t=>{
      const key=String(t.template_code||'');
      if(seenTemplates.has(key)) return false;
      seenTemplates.add(key);
      return true;
    });
    // v1.3.30: Production Gate Sync creates Final Production records after all tasks are completed.
    // Never fall back to all templates after a package is selected, because that makes PC/mobile inconsistent.
    if(!rows.length && selectedPackage && DEFAULT_TEMPLATES_BY_PACKAGE[selectedPackage]) rows=DEFAULT_TEMPLATES_BY_PACKAGE[selectedPackage].map(t=>({...t,package_code:selectedPackage}));
    if(!selectedPackage && !rows.length && templates.length) rows=templates.slice();
    if(!rows.length && selectedPackage){
      rows=[{template_code:'CUSTOM',template_name:`Custom Project for ${selectedPackage}`}];
    }else if(!rows.length){
      rows=[{template_code:'CUSTOM',template_name:'Custom Project'}];
    }
    if(!rows.some(t=>String(t.template_code)===String(tplSel.value))) tplSel.value='';
    tplSel.innerHTML='<option value="">Pilih template</option>'+rows.map(t=>`<option value="${esc(t.template_code)}">${esc(t.template_code)} — ${esc(t.template_name||'')}</option>`).join('');
    renderChoicePanel('selected_template',rows,t=>t.template_code,t=>`${t.template_code} — ${t.template_name||''}`,t=>t.template_name||'Template website client.');
  }
  function renderStaticChoiceOptions(type, rows){
    const select=$(`#${type}`);
    if(!select) return;
    select.innerHTML='<option value="">Pilih</option>'+rows.map(r=>`<option value="${esc(r.value)}">${esc(r.title)}</option>`).join('');
    renderChoicePanel(type,rows,r=>r.value,r=>r.title,r=>r.desc);
  }

  try{
    const [pkgRes,tplRes]=await Promise.all([
      c.from('office_packages').select('package_id,package_code,package_name').order('package_code'),
      c.from('office_templates').select('template_id,package_id,template_code,template_name').order('template_code')
    ]);
    if(pkgRes.error) throw pkgRes.error;
    packages=pkgRes.data||[]; templates=(tplRes.data||[]).map(t=>({...t,template_code:normalizeTemplateCode(t.template_code),template_name:templateDisplayName(t.template_code)}));
    if(!packages.length) fallbackOptions();
  }catch(err){
    console.warn('Intake package/template load fallback. If phone shows fewer templates than PC, run sql/public_intake_template_select_policies.sql',err?.message||err);
    fallbackOptions();
  }
  renderPackageOptions(); renderTemplateOptions();
  renderStaticChoiceOptions('website_objective', WEBSITE_OBJECTIVE_OPTIONS);
  renderStaticChoiceOptions('design_style', DESIGN_STYLE_OPTIONS);
  pkgSel?.addEventListener('change',renderTemplateOptions);
  $('#intakeForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const f=new FormData(e.target);
    const services=f.getAll('services_requested').map(x=>String(x).trim()).filter(Boolean);
    if(!f.get('selected_package')) return toast('Sila pilih package. Package wajib untuk tetapkan skop projek.','error');
    if(!f.get('selected_template')) return toast('Sila pilih template. Template wajib untuk bina production preview yang tepat.','error');
    if(!services.length) return toast('Sila pilih sekurang-kurangnya satu Servis Diperlukan.','error');
    if(!f.get('website_objective')) return toast('Sila pilih Objektif Website.','error');
    if(!f.get('design_style')) return toast('Sila pilih Gaya Design.','error');
    const basePayload={
      client_name:f.get('client_name'),company_name:f.get('company_name'),phone:f.get('phone'),email:f.get('email'),business_type:f.get('business_type'),
      website_objective:f.get('website_objective'),selected_package:f.get('selected_package'),selected_template:f.get('selected_template'),
      services_requested:services,reference_websites:String(f.get('reference_websites')||'').split('\n').map(x=>x.trim()).filter(Boolean),
      branding_colors:f.get('branding_colors'),domain_status:f.get('domain_status'),hosting_status:f.get('hosting_status'),additional_notes:f.get('additional_notes'),status:'INTAKE_SUBMITTED'
    };
    const payload={...basePayload, design_style:f.get('design_style')};
    let {error}=await c.from('office_project_intakes').insert(payload);
    if(error && /design_style|column/i.test(error.message||'')){
      const styleLabel=DESIGN_STYLE_OPTIONS.find(x=>x.value===f.get('design_style'))?.title||f.get('design_style');
      basePayload.additional_notes=[basePayload.additional_notes, `Design Style: ${styleLabel}`].filter(Boolean).join('\n');
      ({error}=await c.from('office_project_intakes').insert(basePayload));
    }
    if(error) return toast(error.message,'error');
    e.target.reset(); renderTemplateOptions(); renderStaticChoiceOptions('website_objective', WEBSITE_OBJECTIVE_OPTIONS); renderStaticChoiceOptions('design_style', DESIGN_STYLE_OPTIONS);
    toast('Borang berjaya dihantar. Team Restu Harmoni akan semak maklumat projek anda.','ok')
  });
}
async function intakes(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('intakes.html','Project Intakes','Semak borang intake client');
  const c=auth.c;
  const [{data,error},{data:projects}]=await Promise.all([
    c.from('office_project_intakes').select('*').order('created_at',{ascending:false}),
    c.from('office_projects').select('project_id,intake_id')
  ]);
  if(error)return toast(error.message,'error');
  const projectByIntake=new Map((projects||[]).filter(p=>p.intake_id).map(p=>[p.intake_id,p.project_id]));
  $('#app').innerHTML=`<div class="card table-wrap"><table><thead><tr><th>Client</th><th>Package</th><th>Template</th><th>Services</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead><tbody>${(data||[]).map(r=>{
    const pid=projectByIntake.get(r.intake_id);
    const services=Array.isArray(r.services_requested)?r.services_requested:[];
    const action=pid?`<a class="btn secondary" href="project-detail.html?id=${pid}">Open Project</a>`:`<button class="btn" onclick="convertIntake('${r.intake_id}')">Create Project</button>`;
    return `<tr><td><b>${esc(r.client_name)}</b><br><span class="muted">${esc(r.company_name||'')} ${esc(r.phone||'')}</span><div class="muted intake-note">${esc(r.website_objective||'')}</div></td><td>${esc(r.selected_package||'-')}</td><td>${esc(r.selected_template||'-')}</td><td><div class="scope-list">${services.slice(0,6).map(x=>`<span>${esc(serviceLabel(x))}</span>`).join('')||'<span>-</span>'}</div></td><td><span class="pill orange">${esc(r.status)}</span></td><td>${fmt(r.created_at)}</td><td>${action}</td></tr>`
  }).join('')}</tbody></table></div>`
}
async function convertIntake(id){
  const c=await db();
  const {data:intake,error:e1}=await c.from('office_project_intakes').select('*').eq('intake_id',id).single();
  if(e1)return toast(e1.message,'error');
  const existingProject=await c.from('office_projects').select('project_id').eq('intake_id',id).maybeSingle();
  if(existingProject.data?.project_id){toast('Project sudah wujud. Membuka project sedia ada.','ok'); setTimeout(()=>location.href='project-detail.html?id='+existingProject.data.project_id,500); return;}
  if(!intake.selected_template) return toast('Template belum dipilih. Sila lengkapkan intake sebelum create project.','error');
  let client=null;
  const key=intake.email?{email:intake.email}:intake.phone?{phone:intake.phone}:null;
  if(key){
    const q=await c.from('office_clients').select('*').match(key).limit(1).maybeSingle();
    client=q.data||null;
  }
  if(!client){
    const {data:newClient,error:e2}=await c.from('office_clients').insert({intake_id:id,client_name:intake.client_name,company_name:intake.company_name,phone:intake.phone,email:intake.email,business_type:intake.business_type,status:'ACTIVE'}).select().single();
    if(e2)return toast(e2.message,'error'); client=newClient;
  }
  const code='RH-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6);
  const {data:project,error:e3}=await c.from('office_projects').insert({client_id:client.client_id,intake_id:id,project_code:code,project_name:(intake.company_name||intake.client_name)+' Website Project',package_code:intake.selected_package||'PACKAGE_A',template_code:intake.selected_template,project_status:'PROJECT_CREATED'}).select().single();
  if(e3)return toast(e3.message,'error');
  await c.from('office_project_intakes').update({status:'PROJECT_CREATED'}).eq('intake_id',id);
  toast('Project berjaya dibuat.','ok'); setTimeout(()=>location.href='project-detail.html?id='+project.project_id,800)
}
async function clients(){const auth=await requireAdmin(); if(!auth)return; shell('clients.html','Clients','Client rasmi selepas intake diluluskan'); const {data,error}=await auth.c.from('office_clients').select('*').order('created_at',{ascending:false}); if(error)return toast(error.message,'error'); $('#app').innerHTML=`<div class="card table-wrap"><table><thead><tr><th>Client</th><th>Contact</th><th>Business</th><th>Created</th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td><b>${esc(r.client_name)}</b><br><span class="muted">${esc(r.company_name||'')}</span></td><td>${esc(r.phone||'')}<br><span class="muted">${esc(r.email||'')}</span></td><td>${esc(r.business_type||'')}</td><td>${fmt(r.created_at)}</td></tr>`).join('')}</tbody></table></div>`}
async function projects(){const auth=await requireAdmin(); if(!auth)return; shell('projects.html','Projects','Production pipeline Office RH'); const {data,error}=await auth.c.from('office_projects').select('*, office_clients(client_name,company_name)').order('created_at',{ascending:false}); if(error)return toast(error.message,'error'); $('#app').innerHTML=`<div class="card table-wrap"><table><thead><tr><th>Project</th><th>Client</th><th>Package</th><th>Status</th><th>Action</th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td><b>${esc(r.project_name)}</b><br><span class="muted">${esc(r.project_code)}</span></td><td>${esc(r.office_clients?.company_name||r.office_clients?.client_name||'-')}</td><td>${esc(r.package_code)}</td><td><span class="pill">${esc(r.project_status)}</span></td><td><a class="btn" href="project-detail.html?id=${r.project_id}">Open</a></td></tr>`).join('')}</tbody></table></div>`}
async function detail(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('projects.html','Project Detail','AI Production Mode — satu engine untuk bina website client.');
  const c=auth.c;
  const id=new URLSearchParams(location.search).get('id');
  const {data:p,error}=await c.from('office_projects').select('*, office_clients(*)').eq('project_id',id).single();
  if(error)return toast(error.message,'error');
  const [{data:intake},{data:finals},{data:tasks}]=await Promise.all([
    p.intake_id ? c.from('office_project_intakes').select('*').eq('intake_id',p.intake_id).maybeSingle() : Promise.resolve({data:null}),
    c.from('office_final_production').select('*').eq('project_id',id).order('created_at',{ascending:false}),
    c.from('office_tasks').select('*,office_departments(*)').eq('project_id',id).order('created_at')
  ]);
  const bundle={project:p,intake:intake||null,finals:finals||[],tasks:tasks||[],outputs:[],reviews:[]};
  const gate=projectCompletionGate(bundle);
  const services=Array.isArray(intake?.services_requested)?intake.services_requested:[];
  const st=String(p.project_status||'PROJECT_CREATED').toUpperCase();
  const generated=['READY_FOR_PREVIEW','CLIENT_APPROVED','READY_FOR_DELIVERY','DELIVERED','COMPLETED'].includes(st) || (finals||[]).length;
  const mainAction=generated
    ? `<a class="btn success" href="preview.html?project_id=${id}">View Preview Website</a><a class="btn secondary" href="final-production.html">Final Production</a>`
    : `<button class="btn success" onclick="generateWebsite('${id}')">Generate Website</button>`;
  const scopeCard=`<div class="card" style="margin-top:16px"><h3>Client Scope From Intake</h3><div class="grid cols2"><div><div class="label">Package</div><p><b>${esc(p.package_code||intake?.selected_package||'-')}</b></p></div><div><div class="label">Template</div><p><b>${esc(p.template_code||intake?.selected_template||'-')}</b></p></div></div><div class="label">Servis Diperlukan</div><div class="scope-list">${services.map(x=>`<span>${esc(serviceLabel(x))}</span>`).join('')||'<span>-</span>'}</div><div class="label" style="margin-top:14px">Objektif Website</div><p class="muted intake-note">${esc(intake?.website_objective||'-')}</p><div class="label">Website Requirement</div><p class="muted intake-note">${esc(intake?.additional_notes||intake?.website_requirements||'-')}</p><div class="label">Warna Branding</div><p class="muted intake-note">${esc(intake?.branding_colors||'-')}</p></div>`;
  const lockedAgents=(tasks||[]).map(t=>`<tr><td>${esc(t.office_departments?.department_name||'-')}</td><td><span class="pill">LOCKED</span></td><td class="muted">Future AI Agent — akan diaktifkan bila API AI multi-agent tersedia.</td></tr>`).join('');
  $('#app').innerHTML=`<div class="grid cols2"><div class="card"><h3>${esc(p.project_name)}</h3><p class="muted">${esc(p.project_code)} · ${esc(p.package_code)} · ${esc(p.template_code||'No template')}</p><p>Client: <b>${esc(p.office_clients?.company_name||p.office_clients?.client_name||'-')}</b></p><span class="pill green">${esc(p.project_status)}</span><p class="muted">Mode: AI Production Single Engine</p></div><div class="card ai-production-card"><div class="section-head"><div><h3>AI Production</h3><p class="muted">Satu engine untuk bina preview website dan ZIP berdasarkan package, template dan servis client.</p></div><span class="pill ${generated?'green':'orange'}">${generated?'GENERATED':'PENDING'}</span></div><div class="toolbar">${mainAction}</div><p class="muted">${esc(gate.reason)}</p></div></div>${scopeCard}<div class="card" style="margin-top:16px"><h3>Future AI Agents</h3><p class="muted">Department lama dikunci dahulu. Multi-agent mode akan dibuka semula selepas API AI sebenar tersedia.</p><div class="table-wrap"><table><thead><tr><th>Agent</th><th>Status</th><th>Note</th></tr></thead><tbody>${lockedAgents||'<tr><td>Project Manager, UI/UX, Content, SEO, Frontend, QA</td><td><span class="pill">LOCKED</span></td><td class="muted">Coming Soon</td></tr>'}</tbody></table></div></div>`;
}
async function generateWebsite(projectId){
  try{
    const bundle=await getProjectBundle(projectId);
    await ensureFinalProduction(projectId,'READY_FOR_PREVIEW');
    await (await db()).from('office_projects').update({project_status:'READY_FOR_PREVIEW'}).eq('project_id',projectId);
    toast('AI Production website berjaya dijana. Preview sudah tersedia.','ok');
    setTimeout(()=>location.href='preview.html?project_id='+encodeURIComponent(projectId),800);
  }catch(e){toast(e.message||e,'error')}
}

function smartScopeText(p,intake){
  const client=p?.office_clients||{};
  const services=Array.isArray(intake?.services_requested)?intake.services_requested.map(serviceLabel):[];
  return [
    `Client: ${client.company_name||client.client_name||'-'}`,
    `Contact: ${client.client_name||'-'} ${client.phone||''} ${client.email||''}`.trim(),
    `Business: ${client.business_type||intake?.business_type||'-'}`,
    `Package: ${p?.package_code||intake?.selected_package||'-'}`,
    `Template: ${p?.template_code||intake?.selected_template||'-'}`,
    `Services: ${services.length?services.join(', '):'-'}`,
    `Objective: ${intake?.website_objective||'-'}`,
    `Requirement: ${intake?.additional_notes||intake?.website_requirements||'-'}`,
    `References: ${Array.isArray(intake?.reference_websites)?intake.reference_websites.join(', '):'-'}`,
    `Branding: ${intake?.branding_colors||'-'}`,
    `Domain: ${intake?.domain_status||'-'}`,
    `Hosting: ${intake?.hosting_status||'-'}`
  ].join('\n');
}
function departmentTaskInstruction(departmentCode){
  const code=String(departmentCode||'').toUpperCase();
  const map={
    PM:'Semak scope client, sahkan package/template/services, hasilkan project brief, timeline dan task breakdown yang jelas.',
    UIUX:'Reka struktur UI/UX, page flow, section layout, CTA dan mobile layout berdasarkan template dan servis dipilih.',
    COPY:'Sediakan copywriting untuk halaman utama, company profile, servis, CTA WhatsApp, contact section dan microcopy form.',
    SEO:'Sediakan title, meta description, keyword cadangan, heading structure dan SEO checklist berdasarkan jenis bisnes.',
    BE:'Sediakan backend/API/data requirement jika servis memerlukan form, booking, portal, payment atau fungsi custom.',
    FE:'Bangunkan frontend berdasarkan template, UI/UX approved, content approved dan servis yang dipilih client.',
    QA:'Semak semua servis dipilih: responsive, form, WhatsApp link, Google Maps, SEO basic, browser test dan delivery readiness.',
    FINAL:'Gabungkan semua output approved, bina preview HTML, sediakan documentation dan final delivery package ZIP.'
  };
  return map[code]||'Sediakan output department berdasarkan scope client dan department lock.';
}
function buildSmartTaskDescription(d,p,intake){
  return `${smartScopeText(p,intake)}\n\nDepartment Lock: ${d.department_code} - ${d.department_name}\nAssigned Digital Staff: ${d.digital_staff||'-'}\n\nTask Instruction:\n${departmentTaskInstruction(d.department_code)}\n\nOutput wajib merujuk scope client di atas. Jangan hasilkan kerja generic.`;
}
async function generateTasks(projectId){
  const c=await db();
  const [{data:p,error:pe},{data:deps,error:de},existing]=await Promise.all([
    c.from('office_projects').select('*, office_clients(*)').eq('project_id',projectId).single(),
    c.from('office_departments').select('*'),
    c.from('office_tasks').select('task_id').eq('project_id',projectId).limit(1)
  ]);
  if(pe)return toast(pe.message,'error');
  if(de)return toast(de.message,'error');
  if((existing.data||[]).length)return toast('Tasks sudah dijana untuk project ini.','error');
  const {data:intake}=p?.intake_id?await c.from('office_project_intakes').select('*').eq('intake_id',p.intake_id).maybeSingle():{data:null};
  const allowed=['PM','UIUX','COPY','SEO','FE','BE','QA','FINAL'];
  const order=new Map(allowed.map((x,i)=>[x,i]));
  const cleanDeps=(deps||[]).filter(d=>allowed.includes(String(d.department_code||'').toUpperCase())).sort((a,b)=>(order.get(String(a.department_code).toUpperCase())??99)-(order.get(String(b.department_code).toUpperCase())??99));
  const tasks=cleanDeps.map(d=>({
    project_id:projectId,
    department_id:d.department_id,
    task_title:`${d.digital_staff} - ${d.department_name} Task`,
    task_description:buildSmartTaskDescription(d,p,intake),
    task_status:'PENDING',
    assigned_staff:d.digital_staff
  }));
  const {error:e}=await c.from('office_tasks').insert(tasks);
  if(e)return toast(e.message,'error');
  await c.from('office_projects').update({project_status:'IN_PROGRESS'}).eq('project_id',projectId);
  toast('Smart scope tasks berjaya dijana.','ok');
  setTimeout(()=>location.reload(),700)
}
function outputHeaderFromTask(t,p,intake,dept){
  const client=p?.office_clients||{};
  const services=Array.isArray(intake?.services_requested)?intake.services_requested.map(serviceLabel):[];
  return [
    `Project: ${p?.project_name||'-'}`,
    `Client: ${client.company_name||client.client_name||'-'}`,
    `Contact: ${client.phone||''} ${client.email||''}`.trim(),
    `Business: ${client.business_type||intake?.business_type||'-'}`,
    `Package: ${p?.package_code||intake?.selected_package||'-'}`,
    `Template: ${p?.template_code||intake?.selected_template||'-'}`,
    `Services: ${services.length?services.join(', '):'-'}`,
    `Objective: ${intake?.website_objective||'-'}`,
    `Requirement: ${intake?.additional_notes||intake?.website_requirements||'-'}`,
    `Department: ${dept?.department_code||''} ${dept?.department_name||''}`.trim(),
    `Digital Staff: ${dept?.digital_staff||t?.assigned_staff||'-'}`
  ].join('\n');
}
function departmentOutputDraft(t,p,intake,dept){
  const code=String(dept?.department_code||'').toUpperCase();
  const services=Array.isArray(intake?.services_requested)?intake.services_requested.map(serviceLabel):[];
  const serviceLines=services.length?services.map(x=>`- ${x}`).join('\n'):'- General website scope';
  const base=outputHeaderFromTask(t,p,intake,dept);
  const blocks={
    PM:`${base}\n\nOUTPUT TITLE: Project Scope & Production Brief\n\n1. Project Summary\nBina website berdasarkan package ${p?.package_code||'-'} dan template ${p?.template_code||'-'} untuk ${p?.office_clients?.company_name||p?.project_name||'client'}.\n\n2. Confirmed Services\n${serviceLines}\n\n3. Department Breakdown\n- UI/UX: wireframe, layout, mobile UX.\n- Content: homepage copy, company profile, CTA dan contact content.\n- SEO: meta title, meta description, keyword dan heading structure.\n- Frontend: HTML/CSS/component structure mengikut template.\n- QA: semak responsive, form, WhatsApp integration dan SEO basic.\n- Final Production: preview, documentation dan delivery package.\n\n4. Success Criteria\n- Semua servis dipilih client wujud dalam preview.\n- Semua department output approved.\n- Preview boleh disemak client sebelum ZIP delivery.`,
    UIUX:`${base}\n\nOUTPUT TITLE: UI/UX Wireframe & Layout Direction\n\n1. Page Structure\n- Header dengan brand/client name.\n- Hero section dengan CTA WhatsApp.\n- Company Profile section.\n- Services/solution section berdasarkan servis dipilih.\n- Contact Form section.\n- Footer dengan contact dan business info.\n\n2. Template Direction\nGunakan struktur ${p?.template_code||'-'} sebagai asas visual.\n\n3. Mobile UX Notes\n- CTA WhatsApp sentiasa jelas.\n- Form ringkas, besar dan mudah ditekan.\n- Section hierarchy tidak terlalu padat.\n\n4. UI Requirement\nSemua elemen mesti menyokong: ${services.join(', ')||'client services'}.`,
    COPY:`${base}\n\nOUTPUT TITLE: Website Copywriting Draft\n\n1. Hero Copy\nWebsite profesional untuk ${p?.office_clients?.company_name||'syarikat anda'} yang memudahkan pelanggan memahami servis dan terus berhubung melalui WhatsApp.\n\n2. Company Profile\n${p?.office_clients?.company_name||'Syarikat ini'} menyediakan penyelesaian berkualiti dalam bidang ${p?.office_clients?.business_type||intake?.business_type||'perniagaan'} dengan fokus kepada kepercayaan, kemudahan dan hasil yang jelas.\n\n3. Services Copy\n${serviceLines}\n\n4. CTA\nHubungi kami melalui WhatsApp untuk pertanyaan, sebut harga atau konsultasi lanjut.\n\n5. Contact Section\nSediakan borang ringkas: nama, telefon, email dan mesej.`,
    SEO:`${base}\n\nOUTPUT TITLE: SEO Structure & Metadata\n\n1. Suggested Meta Title\n${p?.office_clients?.company_name||'Client Website'} | ${p?.office_clients?.business_type||intake?.business_type||'Professional Service'}\n\n2. Meta Description\nKetahui servis ${p?.office_clients?.company_name||'kami'} termasuk ${services.slice(0,3).join(', ')||'servis utama'} dan hubungi kami untuk maklumat lanjut.\n\n3. Keyword Suggestions\n- ${p?.office_clients?.business_type||intake?.business_type||'servis profesional'}\n- ${p?.office_clients?.company_name||'company profile'}\n- contact form website\n- WhatsApp business website\n\n4. Heading Structure\nH1: ${p?.office_clients?.company_name||'Client Website'}\nH2: Tentang Kami, Servis Kami, Hubungi Kami\n\n5. SEO Checklist\n- Title dan description unik.\n- Alt text untuk gambar.\n- CTA jelas.\n- Mobile responsive.`,
    BE:`${base}\n\nOUTPUT TITLE: Backend & Integration Requirement\n\n1. Required Integrations\n${serviceLines}\n\n2. Data Handling\n- Contact form perlu capture nama, telefon, email dan mesej.\n- Submission boleh dihantar ke email/WhatsApp/admin pipeline.\n\n3. Conditional Backend Scope\nJika terdapat booking, portal, payment atau custom function, sediakan API dan table berkaitan. Jika tiada, backend minimum hanya form handling.\n\n4. Security Notes\n- Validate input form.\n- Elak expose credential di frontend.\n- Simpan submission dengan audit timestamp jika diperlukan.`,
    FE:`${base}\n\nOUTPUT TITLE: Frontend Build Specification\n\n1. Pages/Sections\n- Home/Hero\n- Company Profile\n- Services\n- Contact Form\n- WhatsApp CTA\n- Footer\n\n2. Template\nGunakan ${p?.template_code||'-'} sebagai baseline.\n\n3. Components\n- Responsive navigation\n- Hero CTA\n- Service cards\n- Contact form\n- WhatsApp floating button\n\n4. Acceptance Criteria\n- Mobile responsive.\n- Form boleh digunakan.\n- Link WhatsApp aktif.\n- Struktur HTML bersih untuk SEO.`,
    QA:`${base}\n\nOUTPUT TITLE: QA Checklist & Acceptance Criteria\n\n1. Functional Test\n- Contact Form wujud dan boleh dihantar.\n- WhatsApp Integration link betul.\n- Semua servis dipilih dipaparkan.\n\n2. Responsive Test\n- Mobile view kemas.\n- Tablet view tidak bertindih.\n- Desktop view jelas.\n\n3. Content Test\n- Nama client dan company betul.\n- Package/template betul.\n- Copywriting tidak placeholder.\n\n4. SEO Test\n- Title, meta description, H1/H2 wujud.\n\n5. Approval Gate\nLulus hanya jika semua item penting clear.`,
    FINAL:`${base}\n\nOUTPUT TITLE: Final Production Preparation\n\n1. Required Approved Inputs\n- Project scope approved.\n- UI/UX direction approved.\n- Content approved.\n- SEO metadata approved.\n- Frontend spec approved.\n- QA checklist approved.\n\n2. Production Checklist\n- Build preview HTML.\n- Verify client scope in preview.\n- Prepare delivery documentation.\n- Generate final ZIP after client approval.\n\n3. Delivery Rule\nProject tidak boleh marked completed sebelum preview approved, final ZIP generated dan delivery confirmed.`
  };
  return blocks[code] || `${base}\n\nOUTPUT TITLE: Department Output\n\nSediakan output berdasarkan task description dan scope client.\n\n${t?.task_description||''}`;
}
async function generateDepartmentOutput(taskId,projectId){
  const c=await db();
  const {data:t,error:te}=await c.from('office_tasks').select('*,office_departments(*),office_projects(*,office_clients(*))').eq('task_id',taskId).single();
  if(te)return toast(te.message,'error');
  const p=t.office_projects||{};
  const {data:intake}=p?.intake_id?await c.from('office_project_intakes').select('*').eq('intake_id',p.intake_id).maybeSingle():{data:null};
  const {data:existing,error:ee}=await c.from('office_department_outputs').select('*,office_reviews(review_id,review_status)').eq('task_id',taskId).order('submitted_at',{ascending:false}).limit(1);
  if(ee)return toast(ee.message,'error');
  const latest=(existing||[])[0];
  const latestStatus=String(latest?.output_status||'').toUpperCase();
  if(['PENDING_REVIEW','APPROVED'].includes(latestStatus)){
    toast(latestStatus==='APPROVED'?'Output task ini sudah approved.':'Output task ini sudah berada dalam review queue.','error');
    return;
  }
  const content=departmentOutputDraft(t,p,intake,t.office_departments||{});
  let outputId=latest?.output_id;
  if(latest && latestStatus==='REVISION_REQUIRED'){
    const {error}=await c.from('office_department_outputs').update({output_content:{content,generated:true,source:'AI Production Mode v1.3.33'},output_status:'PENDING_REVIEW'}).eq('output_id',latest.output_id);
    if(error)return toast(error.message,'error');
  }else{
    const {data:out,error}=await c.from('office_department_outputs').insert({task_id:taskId,project_id:projectId,department_id:t.department_id,output_content:{content,generated:true,source:'AI Production Mode v1.3.33'},output_status:'PENDING_REVIEW'}).select().single();
    if(error)return toast(error.message,'error');
    outputId=out.output_id;
  }
  const {data:rev}=await c.from('office_reviews').select('review_id').eq('output_id',outputId).eq('review_status','PENDING_REVIEW').limit(1);
  if(!(rev||[]).length){
    const {error:re}=await c.from('office_reviews').insert({output_id:outputId,reviewer:'Admin',review_status:'PENDING_REVIEW'});
    if(re)return toast(re.message,'error');
  }
  await c.from('office_tasks').update({task_status:'PENDING_REVIEW'}).eq('task_id',taskId);
  await c.from('office_projects').update({project_status:'IN_PROGRESS'}).eq('project_id',projectId);
  toast('AI Production output dijana.','ok');
  setTimeout(()=>location.reload(),700);
}
async function addOutputPrompt(taskId,projectId){return generateDepartmentOutput(taskId,projectId)}

async function sendReview(outputId){
  const c=await db();
  const {data:existing,error:checkErr}=await c.from('office_reviews').select('review_id,review_status').eq('output_id',outputId).in('review_status',['PENDING_REVIEW','APPROVED']).limit(1);
  if(checkErr)return toast(checkErr.message,'error');
  if((existing||[]).length){
    await c.from('office_department_outputs').update({output_status:existing[0].review_status}).eq('output_id',outputId);
    toast(existing[0].review_status==='APPROVED'?'Output sudah approved.':'Output sudah berada dalam review queue.','error');
    setTimeout(()=>location.reload(),700); return;
  }
  const {error}=await c.from('office_reviews').insert({output_id:outputId,reviewer:'Admin',review_status:'PENDING_REVIEW'});
  if(error)return toast(error.message,'error');
  await c.from('office_department_outputs').update({output_status:'PENDING_REVIEW'}).eq('output_id',outputId);
  toast('Output dihantar untuk review.','ok'); setTimeout(()=>location.reload(),700)
}

async function tasks(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('tasks.html','Tasks','Semua department tasks');
  const {data,error}=await auth.c.from('office_tasks').select('*,office_projects(project_name),office_departments(department_name)').order('created_at',{ascending:false});
  if(error)return toast(error.message,'error');
  $('#app').innerHTML=`<div class="card table-wrap"><table><thead><tr><th>Project</th><th>Department</th><th>Task</th><th>Status</th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td>${esc(r.office_projects?.project_name||'-')}</td><td>${esc(r.office_departments?.department_name||'-')}</td><td><b>${esc(r.task_title||'-')}</b><br><span class="muted">${esc(r.task_description||'')}</span></td><td><span class="pill">${esc(r.task_status||'-')}</span></td></tr>`).join('')}</tbody></table></div>`;
}
async function reviews(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('reviews.html','Reviews','Approve atau revision output department');
  const {data,error}=await auth.c.from('office_reviews').select('*,office_department_outputs(output_id,project_id,output_content,output_status)').order('reviewed_at',{ascending:false});
  if(error)return toast(error.message,'error');
  const rows=latestByOutputId(data||[]);
  $('#app').innerHTML=`<div class="card table-wrap"><table><thead><tr><th>Output</th><th>Status</th><th>Comment</th><th>Action</th></tr></thead><tbody>${rows.map(r=>{
    const status=String(r.review_status||'').toUpperCase();
    const action=status==='PENDING_REVIEW' ? `<button class="btn success" onclick="reviewAction('${r.review_id}','${r.output_id}','APPROVED')">Approve</button> <button class="btn warn" onclick="reviewAction('${r.review_id}','${r.output_id}','REVISION_REQUIRED')">Revision</button>` : `<span class="muted">${esc(status)}</span>`;
    return `<tr><td><div class="mono dash-output">${esc(outputText(r.office_department_outputs?.output_content))}</div></td><td><span class="pill ${status==='APPROVED'?'green':status==='REVISION_REQUIRED'?'orange':'orange'}">${esc(status)}</span></td><td>${esc(r.review_comment||'')}</td><td>${action}</td></tr>`
  }).join('')}</tbody></table></div>`
}

async function reviewAction(reviewId,outputId,status){
  const comment=prompt('Review note:',status)||'';
  const c=await db();
  const {data:o}=await c.from('office_department_outputs').select('task_id,project_id').eq('output_id',outputId).single();
  await c.from('office_reviews').update({review_status:status,review_comment:comment,reviewed_at:new Date().toISOString()}).eq('review_id',reviewId);
  await c.from('office_department_outputs').update({output_status:status}).eq('output_id',outputId);
  if(o?.task_id) await c.from('office_tasks').update({task_status:status==='APPROVED'?'COMPLETED':'REVISION_REQUIRED'}).eq('task_id',o.task_id);
  if(o?.project_id){
    const {data:allTasks}=await c.from('office_tasks').select('task_id,task_status').eq('project_id',o.project_id);
    const allDone=(allTasks||[]).length && (allTasks||[]).every(t=>['COMPLETED','APPROVED'].includes(String(t.task_status||'').toUpperCase()) || (o.task_id && status==='APPROVED' && t.task_id===o.task_id));
    const nextProjectStatus=status==='APPROVED'?(allDone?'READY_FOR_PREVIEW':'IN_PROGRESS'):'REVISION_REQUIRED';
    await c.from('office_projects').update({project_status:nextProjectStatus}).eq('project_id',o.project_id);
    if(status==='APPROVED' && allDone){
      try{ await ensureFinalProduction(o.project_id,'READY_FOR_PREVIEW'); }
      catch(syncErr){ console.warn('Final production sync warning:', syncErr?.message||syncErr); }
    }
  }
  location.reload();
}
async function completeProject(projectId){return buildProductionPreview(projectId)}
async function completed(){const auth=await requireAdmin(); if(!auth)return; shell('completed-projects.html','Completed Projects','Arkib projek siap'); const {data,error}=await auth.c.from('office_completed_projects').select('*,office_projects(project_name,project_code,package_code)').order('created_at',{ascending:false}); if(error)return toast(error.message,'error'); $('#app').innerHTML=`<div class="card table-wrap"><table><thead><tr><th>Project</th><th>Version</th><th>Status</th><th>Completed</th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td><b>${esc(r.office_projects?.project_name||'-')}</b><br><span class="muted">${esc(r.office_projects?.project_code||'')}</span></td><td>${esc(r.version)}</td><td><span class="pill green">${esc(r.archive_status)}</span></td><td>${fmt(r.created_at)}</td></tr>`).join('')}</tbody></table></div>`}
async function settings(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('settings.html','Settings Control Center','Master data, department dan admin access untuk OFFICE RH.');
  const c=auth.c;
  const [packagesRes,templatesRes,deptsRes,adminsRes,contentIndustriesRes,contentServicesRes,contentFaqRes,contentCtaRes]=await Promise.all([
    c.from('office_packages').select('*').order('package_code'),
    c.from('office_templates').select('*,office_packages(package_code,package_name)').order('template_code'),
    c.from('office_departments').select('*').order('department_code'),
    c.from('admin_users').select('*').order('created_at',{ascending:false}),
    c.from('content_industries').select('*').order('industry_key'),
    c.from('content_services').select('*').order('industry_key').order('sort_order',{ascending:true}),
    c.from('content_faq').select('*').order('industry_key').order('sort_order',{ascending:true}),
    c.from('content_cta').select('*').order('industry_key').order('sort_order',{ascending:true})
  ]);
  const p=packagesRes.data||[], t=templatesRes.data||[], d=deptsRes.data||[], admins=adminsRes.data||[];
  const ci=contentIndustriesRes.data||[], cs=contentServicesRes.data||[], cf=contentFaqRes.data||[], cc=contentCtaRes.data||[];
  const warnings=[packagesRes,templatesRes,deptsRes,adminsRes,contentIndustriesRes,contentServicesRes,contentFaqRes,contentCtaRes].filter(x=>x.error).map(x=>x.error.message);
  if(warnings.length) toast('Settings warning: '+warnings.join(' | '),'error');
  const deptOptions=d.map(x=>`<option value="${esc(x.department_code||x.department_name||'')}">${esc(x.department_code||'')} ${esc(x.department_name||'')}</option>`).join('');
  const pkgOptions=p.map(x=>`<option value="${esc(x.package_id)}">${esc(x.package_code)} · ${esc(x.package_name)}</option>`).join('');
  const industryKeys=[...new Set([...Object.keys(OFFICE_RH_INDUSTRY_REGISTRY),...ci.map(x=>x.industry_key)])].filter(Boolean).sort();
  const industryOptions=industryKeys.map(k=>`<option value="${esc(k)}">${esc(k)} · ${esc(OFFICE_RH_INDUSTRY_REGISTRY[k]?.name||'Custom')}</option>`).join('');
  const adminRows=admins.map(a=>`<tr>
    <td>${deptAvatar(a.full_name||a.email||'Admin','AD')}</td>
    <td><b>${esc(a.full_name||'-')}</b><br><span class="muted">${esc(a.email||'')}</span></td>
    <td><span class="pill">${esc(a.role||'Admin')}</span></td>
    <td>${esc(a.department||a.department_code||'-')}</td>
    <td>${a.is_active===false?'<span class="pill red">Suspended</span>':'<span class="pill green">Active</span>'}</td>
    <td class="action-cell"><button class="btn secondary" onclick="toggleAdminUser('${esc(a.id||'')}','${a.is_active===false?'true':'false'}')">${a.is_active===false?'Activate':'Disable'}</button><button class="btn danger" onclick="deleteAdminUser('${esc(a.id||'')}')">Delete</button></td>
  </tr>`).join('');
  const packageRows=p.map(x=>`<tr><td><b>${esc(x.package_code)}</b></td><td>${esc(x.package_name)}</td><td>${esc(x.description||'')}</td><td class="action-cell"><button class="btn secondary" onclick='editPackage(${JSON.stringify(x)})'>Edit</button><button class="btn danger" onclick="deletePackage('${esc(x.package_id)}','${esc(x.package_code)}')">Delete</button></td></tr>`).join('');
  const templateRows=t.map(x=>`<tr><td><b>${esc(x.template_code)}</b></td><td>${esc(x.template_name)}</td><td>${esc(x.office_packages?.package_code||'-')}</td><td class="action-cell"><button class="btn secondary" onclick='editTemplate(${JSON.stringify({template_id:x.template_id,package_id:x.package_id,template_code:x.template_code,template_name:x.template_name})})'>Edit</button><button class="btn danger" onclick="deleteTemplate('${esc(x.template_id)}','${esc(x.template_code)}')">Delete</button></td></tr>`).join('');
  const deptRows=d.map(x=>`<tr><td>${deptAvatar(x.digital_staff,x.department_code)}</td><td><b>${esc(x.department_code)}</b></td><td>${esc(x.department_name)}</td><td>${esc(x.digital_staff||'')}</td><td class="action-cell"><button class="btn secondary" onclick='editDepartment(${JSON.stringify(x)})'>Edit</button><button class="btn danger" onclick="deleteDepartment('${esc(x.department_id)}','${esc(x.department_code)}')">Delete</button></td></tr>`).join('');
  const contentIndustryRows=ci.map(x=>`<tr><td><b>${esc(x.industry_key)}</b></td><td>${esc(x.industry_name)}</td><td>${esc(x.keywords||'')}</td><td>${esc(x.status||'')}</td><td class="action-cell"><button class="btn secondary" onclick='editContentIndustry(${JSON.stringify(x)})'>Edit</button></td></tr>`).join('');
  const contentServiceRows=cs.slice(0,80).map(x=>`<tr><td>${esc(x.industry_key)}</td><td><b>${esc(x.service_name)}</b></td><td>${esc(x.description||'')}</td><td>${esc(x.status||'')}</td><td class="action-cell"><button class="btn secondary" onclick='editContentService(${JSON.stringify(x)})'>Edit</button></td></tr>`).join('');
  const contentFaqRows=cf.slice(0,80).map(x=>`<tr><td>${esc(x.industry_key)}</td><td><b>${esc(x.question)}</b><br><span class="muted">${esc(x.answer||'')}</span></td><td>${esc(x.status||'')}</td><td class="action-cell"><button class="btn secondary" onclick='editContentFaq(${JSON.stringify(x)})'>Edit</button></td></tr>`).join('');
  const contentCtaRows=cc.slice(0,80).map(x=>`<tr><td>${esc(x.industry_key)}</td><td><b>${esc(x.title)}</b><br><span class="muted">${esc(x.description||'')}</span></td><td>${esc(x.button_text||'')}</td><td>${esc(x.status||'')}</td><td class="action-cell"><button class="btn secondary" onclick='editContentCta(${JSON.stringify(x)})'>Edit</button></td></tr>`).join('');
  $('#app').innerHTML=`
  <div class="settings-grid">
    <section class="card settings-hero">
      <div><div class="label">OFFICE RH SYSTEM</div><h2>Admin & Master Data</h2><p class="muted">Urus pakej, template, department, admin profile dan akses staff daripada satu tempat.</p></div>
      <div class="settings-orb">AI</div>
    </section>

    <section class="card settings-crud-card" id="packages-crud">
      <div class="section-head"><div><h3>Packages</h3><p class="muted">CRUD untuk table <b>office_packages</b>.</p></div><button class="btn secondary" onclick="resetPackageForm()">+ New Package</button></div>
      <form class="form settings-inline-form" onsubmit="savePackage(event)">
        <input type="hidden" name="package_id">
        <div class="form cols3">
          <div class="field"><label>Package Code *</label><input name="package_code" placeholder="PACKAGE_F" required></div>
          <div class="field"><label>Package Name *</label><input name="package_name" placeholder="Corporate Website" required></div>
          <div class="field"><label>Description</label><input name="description" placeholder="Business website/system"></div>
        </div>
        <div class="toolbar"><button class="btn" type="submit">Save Package</button><button class="btn secondary" type="button" onclick="resetPackageForm()">Clear</button></div>
      </form>
      <div class="table-wrap nested-table"><table><thead><tr><th>Code</th><th>Name</th><th>Description</th><th>Action</th></tr></thead><tbody>${packageRows||'<tr><td colspan="4" class="muted">Tiada package.</td></tr>'}</tbody></table></div>
    </section>

    <section class="card settings-crud-card" id="templates-crud">
      <div class="section-head"><div><h3>Templates</h3><p class="muted">CRUD untuk table <b>office_templates</b>. Setiap template mesti link ke package.</p></div><button class="btn secondary" onclick="resetTemplateForm()">+ New Template</button></div>
      <form class="form settings-inline-form" onsubmit="saveTemplate(event)">
        <input type="hidden" name="template_id">
        <div class="form cols2">
          <div class="field"><label>Package *</label><select name="package_id" required><option value="">Pilih Package</option>${pkgOptions}</select></div>
          <div class="field"><label>Template Code *</label><input name="template_code" placeholder="CORP_01" required></div>
          <div class="field"><label>Template Name *</label><input name="template_name" placeholder="Corporate Website Template" required></div>
        </div>
        <div class="toolbar"><button class="btn" type="submit">Save Template</button><button class="btn secondary" type="button" onclick="resetTemplateForm()">Clear</button></div>
      </form>
      <div class="table-wrap nested-table"><table><thead><tr><th>Code</th><th>Name</th><th>Package</th><th>Action</th></tr></thead><tbody>${templateRows||'<tr><td colspan="4" class="muted">Tiada template.</td></tr>'}</tbody></table></div>
    </section>

    <section class="card settings-crud-card" id="departments-crud">
      <div class="section-head"><div><h3>Departments</h3><p class="muted">CRUD untuk table <b>office_departments</b> dan digital staff/avatar.</p></div><button class="btn secondary" onclick="resetDepartmentForm()">+ New Department</button></div>
      <form class="form settings-inline-form" onsubmit="saveDepartment(event)">
        <input type="hidden" name="department_id">
        <div class="form cols3">
          <div class="field"><label>Department Code *</label><input name="department_code" placeholder="UX" required></div>
          <div class="field"><label>Department Name *</label><input name="department_name" placeholder="UX Research" required></div>
          <div class="field"><label>Digital Staff *</label><input name="digital_staff" placeholder="Aina" required></div>
        </div>
        <div class="toolbar"><button class="btn" type="submit">Save Department</button><button class="btn secondary" type="button" onclick="resetDepartmentForm()">Clear</button></div>
      </form>
      <div class="table-wrap nested-table"><table><thead><tr><th>Avatar</th><th>Code</th><th>Name</th><th>Digital Staff</th><th>Action</th></tr></thead><tbody>${deptRows||'<tr><td colspan="5" class="muted">Tiada department.</td></tr>'}</tbody></table></div>
    </section>


    <section class="card settings-crud-card" id="content-bank-crud">
      <div class="section-head"><div><h3>Content Preset Bank v1.4.0</h3><p class="muted">Preset boleh diedit dalam Supabase. Generator akan guna data ini dahulu, fallback kepada preset JS jika table belum tersedia.</p></div><button class="btn secondary" type="button" onclick="copyContentBankSqlGuide()">Copy SQL Guide</button></div>
      <div class="grid cols2">
        <form class="form settings-inline-form" onsubmit="saveContentIndustry(event)">
          <h4>Industry Preset</h4><input type="hidden" name="id"><div class="form cols2"><div class="field"><label>Industry Key *</label><input name="industry_key" placeholder="ELECTRICAL" required></div><div class="field"><label>Industry Name *</label><input name="industry_name" placeholder="Electrical Contractor" required></div><div class="field" style="grid-column:1/-1"><label>Keywords</label><input name="keywords" placeholder="electrical,wiring,cable"></div><div class="field" style="grid-column:1/-1"><label>Default Hero</label><textarea name="default_hero"></textarea></div><div class="field" style="grid-column:1/-1"><label>Default About</label><textarea name="default_about"></textarea></div><div class="field"><label>Status</label><select name="status"><option>ACTIVE</option><option>DISABLED</option></select></div></div><button class="btn" type="submit">Save Industry</button>
        </form>
        <form class="form settings-inline-form" onsubmit="saveContentService(event)">
          <h4>Service Preset</h4><input type="hidden" name="id"><div class="form cols2"><div class="field"><label>Industry *</label><select name="industry_key" required>${industryOptions}</select></div><div class="field"><label>Service Name *</label><input name="service_name" placeholder="Wiring" required></div><div class="field"><label>Service Key</label><input name="service_key" placeholder="wiring"></div><div class="field"><label>Sort</label><input name="sort_order" type="number" value="10"></div><div class="field" style="grid-column:1/-1"><label>Description *</label><textarea name="description" required></textarea></div><div class="field" style="grid-column:1/-1"><label>Benefits</label><input name="benefits" placeholder="Selamat,Kemas,Cepat"></div><div class="field"><label>Status</label><select name="status"><option>ACTIVE</option><option>DISABLED</option></select></div></div><button class="btn" type="submit">Save Service</button>
        </form>
      </div>
      <div class="grid cols2" style="margin-top:16px">
        <form class="form settings-inline-form" onsubmit="saveContentFaq(event)">
          <h4>FAQ Preset</h4><input type="hidden" name="id"><div class="form cols2"><div class="field"><label>Industry *</label><select name="industry_key" required>${industryOptions}</select></div><div class="field"><label>Sort</label><input name="sort_order" type="number" value="10"></div><div class="field" style="grid-column:1/-1"><label>Question *</label><input name="question" required></div><div class="field" style="grid-column:1/-1"><label>Answer *</label><textarea name="answer" required></textarea></div><div class="field"><label>Status</label><select name="status"><option>ACTIVE</option><option>DISABLED</option></select></div></div><button class="btn" type="submit">Save FAQ</button>
        </form>
        <form class="form settings-inline-form" onsubmit="saveContentCta(event)">
          <h4>CTA Preset</h4><input type="hidden" name="id"><div class="form cols2"><div class="field"><label>Industry *</label><select name="industry_key" required>${industryOptions}</select></div><div class="field"><label>Sort</label><input name="sort_order" type="number" value="10"></div><div class="field" style="grid-column:1/-1"><label>Title *</label><input name="title" required></div><div class="field" style="grid-column:1/-1"><label>Description</label><textarea name="description"></textarea></div><div class="field"><label>Button Text</label><input name="button_text" placeholder="Hubungi Sekarang"></div><div class="field"><label>Status</label><select name="status"><option>ACTIVE</option><option>DISABLED</option></select></div></div><button class="btn" type="submit">Save CTA</button>
        </form>
      </div>
      <h4>Industries</h4><div class="table-wrap nested-table"><table><thead><tr><th>Key</th><th>Name</th><th>Keywords</th><th>Status</th><th>Action</th></tr></thead><tbody>${contentIndustryRows||'<tr><td colspan="5" class="muted">Run SQL Content Bank dahulu untuk aktifkan table.</td></tr>'}</tbody></table></div>
      <h4>Services</h4><div class="table-wrap nested-table"><table><thead><tr><th>Industry</th><th>Service</th><th>Description</th><th>Status</th><th>Action</th></tr></thead><tbody>${contentServiceRows||'<tr><td colspan="5" class="muted">Belum ada service preset.</td></tr>'}</tbody></table></div>
      <h4>FAQ</h4><div class="table-wrap nested-table"><table><thead><tr><th>Industry</th><th>Question</th><th>Status</th><th>Action</th></tr></thead><tbody>${contentFaqRows||'<tr><td colspan="4" class="muted">Belum ada FAQ preset.</td></tr>'}</tbody></table></div>
      <h4>CTA</h4><div class="table-wrap nested-table"><table><thead><tr><th>Industry</th><th>CTA</th><th>Button</th><th>Status</th><th>Action</th></tr></thead><tbody>${contentCtaRows||'<tr><td colspan="5" class="muted">Belum ada CTA preset.</td></tr>'}</tbody></table></div>
    </section>

    <section class="card login-voice-card">
      <div class="section-head"><div><h3>AI Assistant · Dashboard Greeting</h3><p class="muted">Kawal ucapan suara selepas dashboard siap load. Login tidak lagi menunggu voice.</p></div><button class="btn secondary" type="button" onclick="playDashboardGreeting(true, window.OFFICE_RH_DASHBOARD_METRICS||{})">Test Voice</button></div>
      <form class="form settings-inline-form" onsubmit="saveLoginVoiceSettings(event)">
        <div class="voice-setting-grid">
          <div class="field"><label>Status Voice</label><select name="enabled"><option value="true">Aktif</option><option value="false">Off</option></select></div>
          <div class="field"><label>Daily Briefing</label><select name="briefing"><option value="true">Aktif</option><option value="false">Ucapan sahaja</option></select></div>
          <div class="field"><label>Voice</label><select name="voice_name"><option value="">Auto pilih voice wanita jika ada</option></select></div>
          <div class="field"><label>Speed</label><input name="rate" type="number" step="0.05" min="0.6" max="1.4"></div>
          <div class="field"><label>Pitch</label><input name="pitch" type="number" step="0.05" min="0.5" max="1.8"></div>
          <div class="field" style="grid-column:1/-1"><label>Greeting Text</label><textarea name="text" placeholder="Assalamualaikum. Bismillahirrahmanirrahim..."></textarea></div>
        </div>
        <div class="toolbar"><button class="btn" type="submit">Save Dashboard Voice</button></div>
      </form>
    </section>

    <section class="card">
      <h3>Admin Users</h3>
      <p class="muted">Tambah profil admin selepas user Auth wujud di Supabase. Untuk keselamatan, frontend tidak menyimpan service role key.</p>
      <form class="form admin-form" onsubmit="saveAdminUser(event)">
        <div class="form cols2">
          <div class="field"><label>Auth User UUID *</label><input name="user_id" placeholder="UUID daripada Supabase Auth Users" required></div>
          <div class="field"><label>Email *</label><input name="email" type="email" placeholder="admin@restuharmoni.com" required></div>
          <div class="field"><label>Nama Penuh *</label><input name="full_name" placeholder="Nama admin/staff" required></div>
          <div class="field"><label>Role</label><select name="role"><option>Super Admin</option><option>Admin</option><option>Project Manager</option><option>Designer</option><option>Developer</option><option>QA</option><option>Reviewer</option><option>Final Production</option></select></div>
          <div class="field"><label>Department</label><select name="department"><option value="">General</option>${deptOptions}</select></div>
          <div class="field"><label>Status</label><select name="is_active"><option value="true">Active</option><option value="false">Suspended</option></select></div>
        </div>
        <div class="toolbar"><button class="btn" type="submit">+ Add Admin Profile</button><button class="btn secondary" type="button" onclick="copyAdminSqlGuide()">Copy SQL Guide</button></div>
      </form>
    </section>
    <section class="card table-wrap settings-admin-table">
      <table><thead><tr><th>Avatar</th><th>Admin</th><th>Role</th><th>Department</th><th>Status</th><th>Action</th></tr></thead><tbody>${adminRows||'<tr><td colspan="6" class="muted">Belum ada admin user.</td></tr>'}</tbody></table>
    </section>

    <section class="card roles-card">
      <h3>Roles & Permissions</h3>
      <div class="role-grid">
        <div><b>Super Admin</b><small>Full access termasuk Settings dan Admin Users.</small></div>
        <div><b>Project Manager</b><small>Intakes, Clients, Projects, Tasks dan Reviews.</small></div>
        <div><b>Production Staff</b><small>Tasks, Workspaces, Prompt Library dan assigned project.</small></div>
        <div><b>Reviewer / QA</b><small>Reviews, QA checklist dan final approval.</small></div>
      </div>
      <p class="muted">Role enforcement bergantung kepada RLS Supabase. UI ini menyediakan asas pengurusan admin dan status aktif.</p>
    </section>
  </div>`;
  const voiceSettings=getDashboardVoiceSettings();
  const vf=document.querySelector('.login-voice-card form');
  if(vf){
    vf.elements.enabled.value=String(voiceSettings.enabled!==false);
    if(vf.elements.briefing) vf.elements.briefing.value=String(voiceSettings.briefing!==false);
    vf.elements.text.value=voiceSettings.text||'';
    vf.elements.rate.value=voiceSettings.rate||0.92;
    vf.elements.pitch.value=voiceSettings.pitch||1.08;
    populateVoiceSelect();
    setTimeout(populateVoiceSelect,700);
  }
}

function fillForm(form, data){Object.entries(data||{}).forEach(([k,v])=>{const el=form?.elements?.[k]; if(el) el.value=v??'';}); form?.scrollIntoView({behavior:'smooth',block:'center'});}
function resetPackageForm(){const f=document.querySelector('#packages-crud form'); if(f) f.reset(); if(f?.elements.package_id) f.elements.package_id.value='';}
function resetTemplateForm(){const f=document.querySelector('#templates-crud form'); if(f) f.reset(); if(f?.elements.template_id) f.elements.template_id.value='';}
function resetDepartmentForm(){const f=document.querySelector('#departments-crud form'); if(f) f.reset(); if(f?.elements.department_id) f.elements.department_id.value='';}
function editPackage(row){fillForm(document.querySelector('#packages-crud form'),row);}
function editTemplate(row){fillForm(document.querySelector('#templates-crud form'),row);}
function editDepartment(row){fillForm(document.querySelector('#departments-crud form'),row);}

async function savePackage(e){
  e.preventDefault();
  const fd=new FormData(e.target);
  const id=String(fd.get('package_id')||'').trim();
  const payload={package_code:String(fd.get('package_code')||'').trim(),package_name:String(fd.get('package_name')||'').trim(),description:String(fd.get('description')||'').trim()};
  if(!payload.package_code||!payload.package_name) return toast('Package Code dan Package Name wajib diisi.','error');
  const c=await db();
  const res=id?await c.from('office_packages').update(payload).eq('package_id',id):await c.from('office_packages').insert(payload);
  if(res.error) return toast('Gagal simpan package: '+res.error.message,'error');
  toast(id?'Package dikemaskini.':'Package ditambah.','ok'); setTimeout(()=>location.reload(),600);
}
async function deletePackage(id,code){
  if(!id) return toast('Package ID tidak dijumpai.','error');
  if(!confirm(`Padam package ${code}? Template yang masih link kepada package ini boleh menyebabkan delete gagal.`)) return;
  const c=await db(); const {error}=await c.from('office_packages').delete().eq('package_id',id);
  if(error) return toast('Gagal padam package: '+error.message,'error');
  toast('Package dipadam.','ok'); setTimeout(()=>location.reload(),600);
}
async function saveTemplate(e){
  e.preventDefault();
  const fd=new FormData(e.target);
  const id=String(fd.get('template_id')||'').trim();
  const payload={package_id:String(fd.get('package_id')||'').trim(),template_code:String(fd.get('template_code')||'').trim(),template_name:String(fd.get('template_name')||'').trim()};
  if(!payload.package_id||!payload.template_code||!payload.template_name) return toast('Package, Template Code dan Template Name wajib diisi.','error');
  const c=await db();
  const res=id?await c.from('office_templates').update(payload).eq('template_id',id):await c.from('office_templates').insert(payload);
  if(res.error) return toast('Gagal simpan template: '+res.error.message,'error');
  toast(id?'Template dikemaskini.':'Template ditambah.','ok'); setTimeout(()=>location.reload(),600);
}
async function deleteTemplate(id,code){
  if(!id) return toast('Template ID tidak dijumpai.','error');
  if(!confirm(`Padam template ${code}?`)) return;
  const c=await db(); const {error}=await c.from('office_templates').delete().eq('template_id',id);
  if(error) return toast('Gagal padam template: '+error.message,'error');
  toast('Template dipadam.','ok'); setTimeout(()=>location.reload(),600);
}
async function saveDepartment(e){
  e.preventDefault();
  const fd=new FormData(e.target);
  const id=String(fd.get('department_id')||'').trim();
  const payload={department_code:String(fd.get('department_code')||'').trim(),department_name:String(fd.get('department_name')||'').trim(),digital_staff:String(fd.get('digital_staff')||'').trim()};
  if(!payload.department_code||!payload.department_name||!payload.digital_staff) return toast('Department Code, Department Name dan Digital Staff wajib diisi.','error');
  const c=await db();
  const res=id?await c.from('office_departments').update(payload).eq('department_id',id):await c.from('office_departments').insert(payload);
  if(res.error) return toast('Gagal simpan department: '+res.error.message,'error');
  toast(id?'Department dikemaskini.':'Department ditambah.','ok'); setTimeout(()=>location.reload(),600);
}
async function deleteDepartment(id,code){
  if(!id) return toast('Department ID tidak dijumpai.','error');
  if(!confirm(`Padam department ${code}? Task/output yang masih link kepada department ini boleh menyebabkan delete gagal.`)) return;
  const c=await db(); const {error}=await c.from('office_departments').delete().eq('department_id',id);
  if(error) return toast('Gagal padam department: '+error.message,'error');
  toast('Department dipadam.','ok'); setTimeout(()=>location.reload(),600);
}

function editContentIndustry(row){fillForm(document.querySelector('#content-bank-crud form[onsubmit="saveContentIndustry(event)"]'),row);}
function editContentService(row){fillForm(document.querySelector('#content-bank-crud form[onsubmit="saveContentService(event)"]'),row);}
function editContentFaq(row){fillForm(document.querySelector('#content-bank-crud form[onsubmit="saveContentFaq(event)"]'),row);}
function editContentCta(row){fillForm(document.querySelector('#content-bank-crud form[onsubmit="saveContentCta(event)"]'),row);}
async function upsertContentRow(table,id,payload,label){
  const c=await db();
  const res=id?await c.from(table).update(payload).eq('id',id):await c.from(table).insert(payload);
  if(res.error) return toast(`Gagal simpan ${label}: ${res.error.message}. Pastikan SQL content bank sudah dijalankan.`, 'error');
  window.OFFICE_RH_CONTENT_BANK_CACHE={};
  toast(`${label} disimpan.`, 'ok'); setTimeout(()=>location.reload(),600);
}
async function saveContentIndustry(e){
  e.preventDefault(); const fd=new FormData(e.target); const id=String(fd.get('id')||'').trim();
  const payload={industry_key:slugKey(fd.get('industry_key')),industry_name:String(fd.get('industry_name')||'').trim(),keywords:String(fd.get('keywords')||'').trim(),default_hero:String(fd.get('default_hero')||'').trim(),default_about:String(fd.get('default_about')||'').trim(),status:String(fd.get('status')||'ACTIVE')};
  if(!payload.industry_key||!payload.industry_name) return toast('Industry Key dan Industry Name wajib diisi.','error');
  await upsertContentRow('content_industries',id,payload,'Industry preset');
}
async function saveContentService(e){
  e.preventDefault(); const fd=new FormData(e.target); const id=String(fd.get('id')||'').trim(); const name=String(fd.get('service_name')||'').trim();
  const payload={industry_key:slugKey(fd.get('industry_key')),service_key:String(fd.get('service_key')||slugKey(name).toLowerCase()).trim(),service_name:name,description:String(fd.get('description')||'').trim(),benefits:String(fd.get('benefits')||'').trim(),sort_order:Number(fd.get('sort_order')||10),status:String(fd.get('status')||'ACTIVE')};
  if(!payload.industry_key||!payload.service_name||!payload.description) return toast('Industry, Service Name dan Description wajib diisi.','error');
  await upsertContentRow('content_services',id,payload,'Service preset');
}
async function saveContentFaq(e){
  e.preventDefault(); const fd=new FormData(e.target); const id=String(fd.get('id')||'').trim();
  const payload={industry_key:slugKey(fd.get('industry_key')),question:String(fd.get('question')||'').trim(),answer:String(fd.get('answer')||'').trim(),sort_order:Number(fd.get('sort_order')||10),status:String(fd.get('status')||'ACTIVE')};
  if(!payload.industry_key||!payload.question||!payload.answer) return toast('Industry, Question dan Answer wajib diisi.','error');
  await upsertContentRow('content_faq',id,payload,'FAQ preset');
}
async function saveContentCta(e){
  e.preventDefault(); const fd=new FormData(e.target); const id=String(fd.get('id')||'').trim();
  const payload={industry_key:slugKey(fd.get('industry_key')),title:String(fd.get('title')||'').trim(),description:String(fd.get('description')||'').trim(),button_text:String(fd.get('button_text')||'Hubungi Sekarang').trim(),sort_order:Number(fd.get('sort_order')||10),status:String(fd.get('status')||'ACTIVE')};
  if(!payload.industry_key||!payload.title) return toast('Industry dan Title wajib diisi.','error');
  await upsertContentRow('content_cta',id,payload,'CTA preset');
}
function copyContentBankSqlGuide(){
  const sql=`Run file: sql/content_preset_bank_v140.sql\n\nSelepas run SQL, buka Settings > Content Preset Bank untuk tambah/edit Industry, Service, FAQ dan CTA.`;
  navigator.clipboard?.writeText(sql); toast('Panduan SQL Content Bank disalin.','ok');
}

async function saveAdminUser(e){
  e.preventDefault();
  const fd=new FormData(e.target);
  const fullPayload={
    user_id:String(fd.get('user_id')||'').trim(),
    email:String(fd.get('email')||'').trim(),
    full_name:String(fd.get('full_name')||'').trim(),
    role:String(fd.get('role')||'Admin').trim(),
    department:String(fd.get('department')||'').trim()||null,
    is_active:String(fd.get('is_active'))==='true'
  };
  if(!fullPayload.user_id||!fullPayload.email||!fullPayload.full_name) return toast('Lengkapkan Auth User UUID, Email dan Nama Penuh.','error');
  const c=await db();

  // Schema-safe insert: sesetengah database OFFICE RH lama hanya ada user_id/is_active/role/full_name.
  // Kita cuba payload penuh dahulu, kemudian buang column yang Supabase kata belum wujud.
  let payload={...fullPayload};
  const removed=[];
  let error=null;
  for(let attempt=0; attempt<8; attempt++){
    const res=await c.from('admin_users').insert(payload);
    error=res.error;
    if(!error) break;
    const msg=String(error.message||'');
    const m=msg.match(/'([^']+)' column/);
    const missing=m?.[1];
    if(missing && Object.prototype.hasOwnProperty.call(payload,missing) && missing!=='user_id'){
      delete payload[missing];
      removed.push(missing);
      continue;
    }
    // Fallback terakhir untuk schema paling minimum.
    if(attempt===0){
      payload={user_id:fullPayload.user_id};
      if(fullPayload.is_active!==undefined) payload.is_active=fullPayload.is_active;
      removed.push('email','full_name','role','department');
      continue;
    }
    break;
  }
  if(error) return toast('Gagal tambah admin: '+error.message,'error');
  if(removed.length){
    toast('Admin profile berjaya ditambah. Nota: column belum wujud tidak disimpan: '+[...new Set(removed)].join(', ')+'. Jalankan SQL migration.','ok');
  }else{
    toast('Admin profile berjaya ditambah.','ok');
  }
  setTimeout(()=>location.reload(),900);
}
async function toggleAdminUser(id,state){
  if(!id) return toast('Admin ID tidak dijumpai.','error');
  const active=state==='true';
  if(!confirm(active?'Aktifkan admin ini?':'Disable admin ini?')) return;
  const c=await db();
  const {error}=await c.from('admin_users').update({is_active:active}).eq('id',id);
  if(error) return toast('Gagal kemaskini admin: '+error.message,'error');
  toast('Status admin dikemaskini.','ok');
  setTimeout(()=>location.reload(),600);
}
async function deleteAdminUser(id){
  if(!id) return toast('Admin ID tidak dijumpai.','error');
  if(!confirm('Padam profil admin ini daripada admin_users? Akaun Auth Supabase tidak akan dipadam.')) return;
  const c=await db();
  const {error}=await c.from('admin_users').delete().eq('id',id);
  if(error) return toast('Gagal padam admin: '+error.message,'error');
  toast('Admin profile dipadam.','ok');
  setTimeout(()=>location.reload(),600);
}
function copyAdminSqlGuide(){
  const txt=`-- 1) Cipta user di Supabase Dashboard > Authentication > Users > Add user\n-- 2) Copy UUID user tersebut\n-- 3) Insert profil admin ke OFFICE RH:\ninsert into admin_users (user_id, full_name, email, role, department, is_active)\nvalues ('AUTH_USER_UUID', 'Nama Admin', 'email@example.com', 'Admin', 'PM', true);`;
  navigator.clipboard?.writeText(txt);
  toast('SQL guide tambah admin disalin.','ok');
}

async function workspaces(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('workspaces.html','Digital Staff Workspaces','Setiap staff mempunyai SOP, prompt, checklist dan output format sendiri.');
  const {data,error}=await auth.c.from('office_departments').select('*').order('department_code');
  if(error)return toast(error.message,'error');
  $('#app').innerHTML=`<div class="grid cols3">${(data||[]).map(d=>`<div class="card staff-card">${staffChip(d.digital_staff,d.department_name,d.department_code)}<div class="label">${esc(d.department_code)}</div><p class="muted">${esc(d.mission||'Workspace manual ChatGPT workflow.')}</p><p><b>Allowed:</b></p><ul>${(d.allowed_outputs||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><b>Forbidden:</b></p><ul>${(d.forbidden_tasks||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="btn secondary" onclick="copyStaffPrompt('${esc(d.digital_staff)}','${esc(d.department_name)}','${esc(d.mission||'')}')">Copy Staff Prompt</button></div>`).join('')}</div>`;
}
function copyStaffPrompt(name,dept,mission){
 const txt=`Anda ialah ${name}, ${dept} dalam Office Restu Harmoni. Misi anda: ${mission}. Patuhi department lock. Jangan buat tugasan department lain. Hasilkan output mengikut format workspace sahaja.`;
 navigator.clipboard?.writeText(txt);
 toast('Prompt '+name+' disalin.','ok');
}
async function promptLibrary(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('prompt-library.html','Prompt Library','Prompt manual untuk digunakan dalam ChatGPT. Tiada AI API digunakan.');
  const {data,error}=await auth.c.from('office_prompt_library').select('*').order('department_code');
  if(error)return toast(error.message,'error');
  $('#app').innerHTML=`<div class="grid cols2">${(data||[]).map(p=>`<div class="card"><div class="label">${esc(p.department_code)} · ${esc(p.staff_name)}</div><h3>${esc(p.prompt_title)}</h3><textarea class="mono promptbox" readonly>${esc(p.prompt_content)}</textarea><p class="muted"><b>Expected:</b> ${esc(p.expected_output||'')}</p><button class="btn" onclick="copyTextById('prompt-${p.prompt_id}')">Copy Prompt</button><textarea id="prompt-${p.prompt_id}" class="hidden">${esc(p.prompt_content)}</textarea></div>`).join('')}</div>`;
}
function copyTextById(id){
 const el=document.getElementById(id); if(!el)return;
 navigator.clipboard?.writeText(el.value||el.textContent||'');
 toast('Prompt disalin.','ok');
}
async function finalProduction(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('final-production.html','Final Production','Preview, client approval, ZIP delivery dan completion gate.');
  const [finalRes,projectRes]=await Promise.all([
    auth.c.from('office_final_production').select('*,office_projects(project_name,project_code,project_status)').order('created_at',{ascending:false}),
    auth.c.from('office_projects').select('project_id,project_name,project_code,project_status,created_at').in('project_status',['READY_FOR_PREVIEW','CLIENT_APPROVED','READY_FOR_DELIVERY','DELIVERED']).order('created_at',{ascending:false})
  ]);
  if(finalRes.error)return toast(finalRes.error.message,'error');
  if(projectRes.error)console.warn('Final production project fallback warning:',projectRes.error.message);
  const finals=finalRes.data||[];
  const byProject=new Map(finals.map(r=>[r.project_id,r]));
  const fallback=(projectRes.data||[]).filter(p=>!byProject.has(p.project_id)).map(p=>({
    project_id:p.project_id,
    production_id:null,
    production_status:p.project_status==='READY_FOR_PREVIEW'?'READY_FOR_PREVIEW':p.project_status,
    documentation_url:'preview.html?project_id='+encodeURIComponent(p.project_id),
    final_package_url:null,
    created_at:p.created_at,
    office_projects:{project_name:p.project_name,project_code:p.project_code,project_status:p.project_status}
  }));
  const rows=[...finals,...fallback];
  $('#app').innerHTML=`<div class="card table-wrap"><table><thead><tr><th>Project</th><th>Status</th><th>Preview</th><th>Final Package</th><th>Action</th><th>Created</th></tr></thead><tbody>${rows.map(r=>{
    const st=String(r.production_status||'').toUpperCase();
    const preview=`<a class="btn secondary" href="preview.html?project_id=${r.project_id}">View Final Project</a>`;
    const approve=st==='READY_FOR_PREVIEW'?`<button class="btn success" onclick="clientApproveProject('${r.project_id}')">Client Approve</button>`:'';
    const zip=['CLIENT_APPROVED','READY_FOR_DELIVERY','DELIVERED'].includes(st)?`<button class="btn" onclick="downloadFinalZip('${r.project_id}')">Generate ZIP</button>`:'';
    const deliver=st==='READY_FOR_DELIVERY'&&r.production_id?`<button class="btn success" onclick="deliverCompleted('${r.project_id}','${r.production_id}')">Mark Delivered</button>`:'';
    return `<tr><td><b>${esc(r.office_projects?.project_name||'-')}</b><br><span class="muted">${esc(r.office_projects?.project_code||'')}</span></td><td><span class="pill ${st==='DELIVERED'?'green':'orange'}">${esc(st||'-')}</span></td><td>${preview}</td><td>${r.final_package_url?esc(r.final_package_url):'-'}</td><td><div class="toolbar">${approve}${zip}${deliver}</div></td><td>${fmt(r.created_at)}</td></tr>`
  }).join('')||`<tr><td colspan="6"><p class="muted">Belum ada project AI Production yang dijana.</p></td></tr>`}</tbody></table></div>`;
}

async function files(){
  const auth=await requireAdmin(); if(!auth)return;
  shell('files.html','Project Files','Semua fail projek yang direkodkan dalam office_project_files.');
  const {data,error}=await auth.c.from('office_project_files').select('*,office_projects(project_code,project_name)').order('uploaded_at',{ascending:false});
  if(error)return toast(error.message,'error');
  $('#app').innerHTML=`<div class="card table-wrap"><table><thead><tr><th>Project</th><th>Type</th><th>File</th><th>Status</th><th>Uploaded</th></tr></thead><tbody>${(data||[]).map(f=>`<tr><td>${esc(f.office_projects?.project_code||'-')}</td><td>${esc(f.file_type||'')}</td><td>${f.file_url?`<a href="${esc(f.file_url)}" target="_blank">${esc(f.file_name||'Open File')}</a>`:esc(f.file_name||'-')}</td><td>${esc(f.status||'')}</td><td>${fmt(f.uploaded_at)}</td></tr>`).join('')}</tbody></table></div>`;
}


function normalizePageName(){
  let p=location.pathname.split('/').pop()||'index';
  p=p.split('?')[0].split('#')[0].trim();
  if(!p) p='index';
  if(!p.endsWith('.html')) p=p+'.html';
  return p;
}
function showBootError(err){
  console.error('Office RH boot error:',err);
  document.body.innerHTML=`<main class="main single"><div class="card"><h2>Office RH tidak dapat memaparkan halaman ini</h2><p class="muted">${esc(err?.message||err||'Unknown error')}</p><p class="muted">Cuba refresh. Jika masih berlaku, semak Console dan Supabase policy/table.</p><a class="btn" href="dashboard.html">Kembali ke Dashboard</a></div></main>`;
}
window.addEventListener('DOMContentLoaded',()=>{
  const routes={
    'login.html':initLogin,
    'dashboard.html':dashboard,
    'index.html':dashboard,
    'project-intake.html':publicIntake,
    'intakes.html':intakes,
    'clients.html':clients,
    'projects.html':projects,
    'project-detail.html':detail,
    'preview.html':productionPreview,
    'tasks.html':tasks,
    'reviews.html':reviews,
    'workspaces.html':workspaces,
    'prompt-library.html':promptLibrary,
    'final-production.html':finalProduction,
    'files.html':files,
    'completed-projects.html':completed,
    'settings.html':settings
  };
  const page=normalizePageName();
  const fn=routes[page];
  if(!fn){
    document.body.innerHTML=`<main class="main single"><div class="card"><h2>Halaman tidak dijumpai</h2><p class="muted">Route: ${esc(page)}</p><a class="btn" href="dashboard.html">Kembali ke Dashboard</a></div></main>`;
    return;
  }
  Promise.resolve(fn()).catch(showBootError);
});

console.info('Office RH Version', window.OFFICE_RH_VERSION || {});
