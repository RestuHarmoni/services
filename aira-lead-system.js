(function(){
  const SUPABASE_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const cfg=window.RH_SUPABASE_CONFIG||{};
  let supabaseClient=null;
  const DEFAULT_QUESTION_BANK={"version": "v6.4.0-lead-answers", "assistantName": "Aira", "positioning": "AI Website Consultant", "intro": ["Hai 👋 Saya <strong>Aira</strong>, AI Website Consultant.", "Saya boleh bantu cadangkan struktur website, pakej dan langkah seterusnya mengikut jenis bisnes anda."], "steps": [{"key": "business_type", "question": "Apakah kategori perniagaan yang ingin anda bina website?", "type": "choice", "required": true, "options": ["Servis Aircond", "Homestay", "Kereta Sewa", "Kontraktor & Renovasi", "Kedai Makan", "Butik / Fashion", "Produk Online", "Company Profile", "Klinik / Profesional", "Lain-lain"]}, {"key": "objective", "question": "Apakah matlamat utama website ini?", "type": "choice", "required": true, "options": ["Dapatkan lebih banyak pertanyaan pelanggan", "Paparkan servis & portfolio", "Tempahan / booking enquiry", "Company profile yang lebih dipercayai", "Jual produk / katalog online", "Landing page untuk iklan"]}, {"key": "has_website", "question": "Adakah anda sudah mempunyai website sekarang?", "type": "choice", "required": false, "options": ["Belum ada website", "Ada, tetapi mahu upgrade", "Ada domain sahaja", "Belum pasti"]}, {"key": "has_domain", "question": "Adakah anda sudah mempunyai domain sendiri?", "type": "choice", "required": false, "options": ["Ya, sudah ada domain", "Belum ada domain", "Perlu bantuan beli domain", "Belum pasti"]}, {"key": "content_ready", "question": "Bahan website sudah tersedia?", "type": "choice", "required": false, "options": ["Logo & gambar sudah ada", "Ada sebahagian bahan", "Belum ada bahan", "Perlu bantuan susun content"]}, {"key": "industry_detail", "question": "Maklumat tambahan yang penting untuk kategori bisnes anda?", "type": "choice", "required": false, "conditional": true, "conditions": {"Homestay": ["1 unit homestay", "2–5 unit homestay", "Lebih 5 unit", "Perlu galeri & kemudahan"], "Kereta Sewa": ["1–5 kenderaan", "6–20 kenderaan", "Lebih 20 kenderaan", "Perlu senarai harga & booking"], "Kontraktor & Renovasi": ["Ada portfolio projek", "Belum ada portfolio", "Perlu quotation form", "Perlu paparan servis lengkap"], "Servis Aircond": ["Servis rumah", "Servis pejabat", "Ada kawasan liputan tertentu", "Perlu jadual servis/booking"], "Kedai Makan": ["Menu harian", "Catering", "Tempahan WhatsApp", "Lokasi Google Maps"], "Produk Online": ["1 produk utama", "Katalog banyak produk", "Perlu testimoni", "Order melalui WhatsApp"]}}, {"key": "budget", "question": "Anggaran bajet yang selesa untuk projek ini?", "type": "choice", "required": true, "options": ["RM699 – RM999", "RM1000 – RM2000", "RM2000+", "Belum pasti"]}, {"key": "timeline", "question": "Bila anda mahu website mula siap atau dilancarkan?", "type": "choice", "required": true, "options": ["Segera", "1–2 minggu", "Dalam 1 bulan", "Belum pasti"]}, {"key": "name", "question": "Boleh saya tahu nama anda?", "type": "input", "input": true, "placeholder": "Contoh: Ahmad", "required": true}, {"key": "phone", "question": "Nombor WhatsApp untuk team kami hubungi?", "type": "input", "input": true, "placeholder": "Contoh: 0123456789", "required": true, "validation": "phone"}], "packages": {"RH Starter": {"price": "RM699", "bestFor": ["Aircond", "Plumbing", "Elektrik", "Servis kecil"], "features": ["1 page landing page", "Servis utama", "Galeri asas", "FAQ", "Lead form Aira"]}, "RH Business": {"price": "RM999", "bestFor": ["Homestay", "Kereta Sewa", "Kedai Makan", "Kontraktor", "Butik"], "features": ["Website lebih lengkap", "Galeri premium", "Booking enquiry", "Testimoni", "SEO asas"]}, "RH Pro": {"price": "RM1499", "bestFor": ["Corporate", "Klinik", "Hartanah", "Syarikat"], "features": ["Premium UI", "Lead capture", "Portfolio", "Advanced section", "SEO lebih lengkap"]}, "Custom": {"price": "Quotation", "bestFor": ["Sistem khas", "Dashboard", "Portal", "Automation"], "features": ["Scope custom", "Quotation ikut keperluan"]}}};
  window.RH_AIRA_DEFAULT_QUESTION_BANK = DEFAULT_QUESTION_BANK;
  const DEFAULT_FAQ_BANK={"version": "v6.2.0-admin-flex", "quickActions": ["Dapatkan Cadangan Website", "Harga Pakej", "Lihat Contoh Website", "Berapa Lama Siap?", "Domain & Hosting", "SEO Google", "Website atau Facebook?", "Maintenance & Support"], "faq": [{"topic": "harga", "triggers": ["harga", "kos", "price", "pakej", "package", "bayaran", "berapa"], "answer": "Pakej website bermula daripada <strong>RH Starter RM699</strong>, <strong>RH Business RM999</strong>, dan <strong>RH Pro RM1499</strong>. Harga sebenar bergantung kepada jenis bisnes, fungsi dan tahap design."}, {"topic": "tempoh", "triggers": ["lama", "siap", "tempoh", "berapa hari", "duration", "ready"], "answer": "Kebanyakan website boleh siap dalam <strong>3–7 hari bekerja</strong> selepas bahan lengkap diterima. Projek custom mungkin mengambil masa lebih lama."}, {"topic": "domain", "triggers": ["domain", ".com", ".my", "nama website"], "answer": "Domain boleh disediakan atau dibantu setup. Contoh: <strong>namabisnes.com</strong> atau <strong>namabisnes.my</strong>."}, {"topic": "hosting", "triggers": ["hosting", "server", "online", "publish"], "answer": "Ya, kami bantu setup hosting supaya website boleh diakses secara online."}, {"topic": "seo", "triggers": ["seo", "google", "ranking", "search", "carian"], "answer": "Website disediakan dengan <strong>SEO asas</strong>: meta title, meta description, mobile responsive, heading structure, sitemap dan Google-ready structure."}, {"topic": "edit", "triggers": ["edit", "ubah", "update", "kemaskini", "sendiri"], "answer": "Boleh. Bergantung kepada pakej, kandungan boleh disusun supaya mudah dikemaskini. Maintenance tambahan juga boleh dibincangkan."}, {"topic": "logo_gambar", "triggers": ["logo", "gambar", "image", "photo", "tak ada gambar", "tiada gambar"], "answer": "Tiada masalah. Jika ada logo/gambar sendiri, kami boleh gunakan. Jika belum ada, kami boleh bantu cadangkan visual yang sesuai."}, {"topic": "contoh", "triggers": ["contoh", "demo", "portfolio", "template", "sample"], "answer": "Kami ada contoh website untuk Kedai Makan, Homestay, Kereta Sewa, Aircond, Renovation, Butik, Corporate dan Produk Online."}, {"topic": "bayaran", "triggers": ["ansuran", "deposit", "bayar", "installment"], "answer": "Kaedah bayaran boleh dibincangkan mengikut scope projek. Biasanya projek dimulakan selepas maklumat asas dan pakej disahkan."}, {"topic": "proses", "triggers": ["proses", "cara", "macam mana", "step"], "answer": "Proses ringkas: Aira kumpul maklumat, kami cadangkan pakej, anda sediakan bahan, website dibina, semakan dan live."}, {"topic": "website_vs_facebook", "triggers": ["facebook", "fb", "website atau facebook", "perlu website", "instagram"], "answer": "Facebook dan Instagram bagus untuk promosi harian. Website pula berfungsi sebagai pusat rujukan rasmi untuk servis, portfolio, testimoni, harga permulaan dan maklumat bisnes supaya pelanggan lebih yakin sebelum menghubungi anda."}, {"topic": "google_business", "triggers": ["google business", "gmb", "google map", "google maps", "map"], "answer": "Website boleh disusun supaya serasi dengan Google Business Profile. Ini membantu pelanggan melihat maklumat lengkap selepas mereka jumpa bisnes anda di Google Search atau Google Maps."}, {"topic": "whatsapp_integration", "triggers": ["whatsapp", "wa", "chat", "butang whatsapp", "link whatsapp"], "answer": "Ya, website boleh disambungkan dengan butang WhatsApp, borang lead dan flow Aira supaya pertanyaan pelanggan lebih tersusun sebelum anda follow-up."}, {"topic": "maintenance", "triggers": ["maintenance", "support", "jaga website", "kemaskini bulanan", "update website"], "answer": "Maintenance boleh dibincangkan mengikut keperluan. Contohnya kemaskini gambar, servis, harga, artikel SEO atau penambahbaikan kecil selepas website live."}, {"topic": "ownership", "triggers": ["hak milik", "owner", "siapa punya website", "milik saya", "akses"], "answer": "Butiran hak milik, akses domain, hosting dan fail website boleh disahkan semasa quotation supaya kedua-dua pihak jelas dari awal."}]};
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
  function loadBank(){
    const qb=safeJson(localStorage.getItem("rh_aira_question_bank"),DEFAULT_QUESTION_BANK);
    const fb=safeJson(localStorage.getItem("rh_aira_faq_bank"),DEFAULT_FAQ_BANK);
    return normalizeBank(qb,fb);
  }
  let BANK=loadBank();
  async function loadRemoteBank(){
    if(window.RH_AIRA_DATA_SERVICE){
      const res=await window.RH_AIRA_DATA_SERVICE.loadAll();
      if(res&&res.questionBank){BANK=normalizeBank(res.questionBank,res.faqBank);window.RH_AIRA_LEAD_SYSTEM.BANK=BANK;return {ok:true,source:res.source};}
    }
    return {ok:false,source:'localStorage'};
  }
  window.addEventListener('storage',e=>{if(e.key==='rh_aira_question_bank'||e.key==='rh_aira_faq_bank')location.reload();});
  function loadSupabase(){return new Promise(resolve=>{if(window.supabase){resolve(true);return;}const s=document.createElement("script");s.src=SUPABASE_CDN;s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.head.appendChild(s);});}
  async function initSupabase(){if(supabaseClient)return supabaseClient;if(!cfg.url||!cfg.anonKey||cfg.url.includes("PASTE_"))return null;const ok=await loadSupabase();if(!ok||!window.supabase)return null;supabaseClient=window.supabase.createClient(cfg.url,cfg.anonKey);return supabaseClient;}
  function normalizePhone(v){return String(v||"").replace(/[\s-]/g,"");}
  function validPhone(v){return /^(\+?6?01)[0-9]{7,10}$/.test(normalizePhone(v));}
  function scoreLead(data){let score=40;if(data.budget==="RM2000+")score+=30;else if(data.budget==="RM1000 – RM2000")score+=20;else if(data.budget==="RM699 – RM999")score+=10;if(data.timeline==="Segera")score+=25;else if(String(data.timeline||'').toLowerCase().includes("1–2"))score+=15;else if(String(data.timeline||'').toLowerCase().includes("bulan"))score+=8;if(["Company Profile","Klinik / Profesional","Hartanah"].includes(data.business_type))score+=10;if(String(data.objective||'').toLowerCase().includes("booking")||String(data.objective||'').toLowerCase().includes("company")||String(data.objective||'').toLowerCase().includes("jual"))score+=8;if(data.has_website==="Ada, tetapi mahu upgrade")score+=5;if(data.content_ready==="Logo & gambar sudah ada")score+=5;return Math.min(score,100);}
  function packageFor(data){if(String(data.objective||'').toLowerCase().includes("custom"))return"Custom";if(data.budget==="RM2000+")return"RH Pro";if(["Klinik / Profesional","Company Profile","Hartanah"].includes(data.business_type))return"RH Pro";if(data.budget==="RM1000 – RM2000")return"RH Business";if(["Homestay","Kereta Sewa","Kedai Makan","Kontraktor & Renovasi","Butik / Fashion","Produk Online"].includes(data.business_type))return"RH Business";return"RH Starter";}
  function priceFor(pkg){const p=BANK.packages&&BANK.packages[pkg];return p&&p.price?p.price:(pkg==="RH Starter"?"RM699":pkg==="RH Business"?"RM999":pkg==="RH Pro"?"RM1499":"Quotation");}
  function tempFor(score){return score>=80?"HOT":score>=60?"WARM":"COLD";}
  function featuresFor(pkg){const p=BANK.packages&&BANK.packages[pkg];if(p&&Array.isArray(p.features))return p.features;const map={"RH Starter":["1 page landing page","Servis utama","Galeri asas","FAQ","Lead form Aira"],"RH Business":["Website lebih lengkap","Galeri premium","Booking enquiry","Testimoni","SEO asas"],"RH Pro":["Premium UI","Lead capture","Portfolio","Advanced section","SEO lebih lengkap"],"Custom":["Scope custom","Quotation ikut keperluan","Sesuai untuk sistem khas"]};return map[pkg]||map["RH Starter"];}
  function getLocalLeads(){try{return JSON.parse(localStorage.getItem("rh_leads")||"[]");}catch(e){return[];}}
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
    const {answers,answer_snapshot,answers_json,...row}=lead||{};
    return row;
  }
  async function saveLead(lead){
    const last=Number(localStorage.getItem("rh_last_lead_submit")||0);
    if(Date.now()-last<60000){return{ok:false,mode:"blocked",error:"Sila tunggu sebentar sebelum hantar semula."};}
    localStorage.setItem("rh_last_lead_submit",String(Date.now()));
    const client=await initSupabase();
    if(!client){saveLocalLead(lead);return{ok:true,mode:"local"};}
    const row=stripLeadForInsert(lead);
    row.id=row.id||(crypto&&crypto.randomUUID?crypto.randomUUID():"LEAD-"+Date.now());
    const ins=await client.from("leads").insert([row]);
    if(ins.error){
      console.error("Aira lead Supabase insert failed:",ins.error);
      saveLocalLead(lead);
      return{ok:false,mode:"local",error:ins.error.message};
    }
    const answers=Array.isArray(lead.answers)?lead.answers:[];
    if(row.id&&answers.length){
      const answerRows=answers.map(a=>({
        lead_id:String(row.id),
        question_key:a.question_key,
        question:a.question,
        answer:String(a.answer??''),
        sort_order:a.sort_order||0,
        answer_type:a.type||'choice'
      }));
      const ans=await client.from("lead_answers").insert(answerRows);
      if(ans.error){
        console.warn("Aira lead_answers insert failed:",ans.error);
        return{ok:true,mode:"supabase",warning:"Lead saved, tetapi jawapan detail gagal disimpan: "+ans.error.message};
      }
    }
    return{ok:true,mode:"supabase"};
  }
  function matchFAQ(input){const q=String(input||"").toLowerCase();for(const item of BANK.faq){for(const trig of (item.triggers||[])){if(q.includes(String(trig).toLowerCase()))return item;}}return null;}
  function createLeadPayload(data){
    const recommended_package=packageFor(data),lead_score=scoreLead(data),answers=buildAnswerSnapshot(data);
    const compact=answers.map(a=>`${a.question}: ${a.answer}`).join(" | ");
    const notes=[data.notes||"",compact?"Aira Answers: "+compact:""];
    return{name:data.name,phone:normalizePhone(data.phone),business_type:data.business_type,objective:data.objective,budget:data.budget,timeline:data.timeline,recommended_package,lead_score,lead_temperature:tempFor(lead_score),status:"NEW",notes:notes.filter(Boolean).join(" | "),source:"Aira",page_url:location.href,user_agent:navigator.userAgent,answers};
  }
  window.RH_AIRA_LEAD_SYSTEM={BANK,DEFAULT_QUESTION_BANK,DEFAULT_FAQ_BANK,loadRemoteBank,initSupabase,normalizePhone,validPhone,scoreLead,packageFor,priceFor,tempFor,featuresFor,getLocalLeads,saveLead,createLeadPayload,buildAnswerSnapshot,matchFAQ};
})();
