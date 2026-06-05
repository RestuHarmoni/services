
(function(){
  const SUPABASE_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const cfg=window.RH_SUPABASE_CONFIG||{};
  let supabaseClient=null;
  const BANK={
    businessOptions:["Aircond","Homestay","Kereta Sewa","Kedai Makan","Kontraktor","Butik","Hartanah","Klinik","Produk Online","Lain-lain"],
    objectiveOptions:["Dapatkan pelanggan","Booking","Company Profile","Jual Produk","Landing Page","Custom"],
    budgetOptions:["RM699 – RM999","RM1000 – RM2000","RM2000+","Belum pasti"],
    timelineOptions:["Segera","1–2 Minggu","1 Bulan","Belum pasti"],
    quickActions:["Cadangkan Website Saya","Harga Pakej","Lihat Contoh Website","Berapa Lama Siap?","Domain & Hosting","SEO Google","Boleh Edit Sendiri?","Saya Tiada Logo/Gambar"],
    faq:[
      {topic:"harga",triggers:["harga","kos","price","pakej","package","bayaran","berapa"],answer:"Pakej website bermula daripada <strong>RH Starter RM699</strong>, <strong>RH Business RM999</strong>, dan <strong>RH Pro RM1499</strong>. Harga sebenar bergantung kepada jenis bisnes, fungsi dan tahap design."},
      {topic:"tempoh",triggers:["lama","siap","tempoh","berapa hari","duration","ready"],answer:"Kebanyakan website boleh siap dalam <strong>3–7 hari bekerja</strong> selepas bahan lengkap diterima. Projek custom mungkin mengambil masa lebih lama."},
      {topic:"domain",triggers:["domain",".com",".my","nama website"],answer:"Domain boleh disediakan atau dibantu setup. Contoh: <strong>namabisnes.com</strong> atau <strong>namabisnes.my</strong>."},
      {topic:"hosting",triggers:["hosting","server","online","publish"],answer:"Ya, kami bantu setup hosting supaya website boleh diakses secara online."},
      {topic:"seo",triggers:["seo","google","ranking","search","carian"],answer:"Website disediakan dengan <strong>SEO asas</strong>: meta title, meta description, mobile responsive, heading structure, sitemap dan Google-ready structure."},
      {topic:"edit",triggers:["edit","ubah","update","kemaskini","sendiri"],answer:"Boleh. Bergantung kepada pakej, kandungan boleh disusun supaya mudah dikemaskini. Maintenance tambahan juga boleh dibincangkan."},
      {topic:"logo_gambar",triggers:["logo","gambar","image","photo","tak ada gambar","tiada gambar"],answer:"Tiada masalah. Jika ada logo/gambar sendiri, kami boleh gunakan. Jika belum ada, kami boleh bantu cadangkan visual yang sesuai."},
      {topic:"contoh",triggers:["contoh","demo","portfolio","template","sample"],answer:"Kami ada contoh website untuk Kedai Makan, Homestay, Kereta Sewa, Aircond, Renovation, Butik, Corporate dan Produk Online."},
      {topic:"bayaran",triggers:["ansuran","deposit","bayar","installment"],answer:"Kaedah bayaran boleh dibincangkan mengikut scope projek. Biasanya projek dimulakan selepas maklumat asas dan pakej disahkan."},
      {topic:"proses",triggers:["proses","cara","macam mana","step"],answer:"Proses ringkas: Aira kumpul maklumat, kami cadangkan pakej, anda sediakan bahan, website dibina, semakan dan live."}
    ]
  };
  function loadSupabase(){return new Promise(resolve=>{if(window.supabase){resolve(true);return;}const s=document.createElement("script");s.src=SUPABASE_CDN;s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.head.appendChild(s);});}
  async function initSupabase(){if(supabaseClient)return supabaseClient;if(!cfg.url||!cfg.anonKey||cfg.url.includes("PASTE_"))return null;const ok=await loadSupabase();if(!ok||!window.supabase)return null;supabaseClient=window.supabase.createClient(cfg.url,cfg.anonKey);return supabaseClient;}
  function normalizePhone(v){return String(v||"").replace(/[\s-]/g,"");}
  function validPhone(v){return /^(\+?6?01)[0-9]{7,10}$/.test(normalizePhone(v));}
  function scoreLead(data){let score=40;if(data.budget==="RM2000+")score+=30;else if(data.budget==="RM1000 – RM2000")score+=20;else if(data.budget==="RM699 – RM999")score+=10;if(data.timeline==="Segera")score+=25;else if(data.timeline==="1–2 Minggu")score+=15;else if(data.timeline==="1 Bulan")score+=8;if(["Corporate","Klinik","Hartanah"].includes(data.business_type))score+=10;if(["Booking","Company Profile","Jual Produk"].includes(data.objective))score+=8;return Math.min(score,100);}
  function packageFor(data){if(data.objective==="Custom")return"Custom";if(data.budget==="RM2000+")return"RH Pro";if(["Klinik","Hartanah"].includes(data.business_type))return"RH Pro";if(data.budget==="RM1000 – RM2000")return"RH Business";if(["Homestay","Kereta Sewa","Kedai Makan","Kontraktor","Butik","Produk Online"].includes(data.business_type))return"RH Business";return"RH Starter";}
  function priceFor(pkg){return pkg==="RH Starter"?"RM699":pkg==="RH Business"?"RM999":pkg==="RH Pro"?"RM1499":"Quotation";}
  function tempFor(score){return score>=80?"HOT":score>=60?"WARM":"COLD";}
  function featuresFor(pkg){const map={"RH Starter":["1 page landing page","Servis utama","Galeri asas","FAQ","Lead form Aira"],"RH Business":["Website lebih lengkap","Galeri premium","Booking enquiry","Testimoni","SEO asas"],"RH Pro":["Premium UI","Lead capture","Portfolio","Advanced section","SEO lebih lengkap"],"Custom":["Scope custom","Quotation ikut keperluan","Sesuai untuk sistem khas"]};return map[pkg]||map["RH Starter"];}
  function getLocalLeads(){try{return JSON.parse(localStorage.getItem("rh_leads")||"[]");}catch(e){return[];}}
  function saveLocalLead(lead){const list=getLocalLeads();list.unshift({...lead,id:"LOCAL-"+Date.now(),created_at:new Date().toISOString()});localStorage.setItem("rh_leads",JSON.stringify(list));}
  async function saveLead(lead){
    const last=Number(localStorage.getItem("rh_last_lead_submit")||0);
    if(Date.now()-last<60000){return{ok:false,mode:"blocked",error:"Sila tunggu sebentar sebelum hantar semula."};}
    localStorage.setItem("rh_last_lead_submit",String(Date.now()));
    const client=await initSupabase();
    if(!client){saveLocalLead(lead);return{ok:true,mode:"local"};}
    const {error}=await client.from("leads").insert([lead]);
    if(error){saveLocalLead(lead);return{ok:false,mode:"local",error:error.message};}
    return{ok:true,mode:"supabase"};
  }
  function matchFAQ(input){const q=String(input||"").toLowerCase();for(const item of BANK.faq){for(const trig of item.triggers){if(q.includes(trig.toLowerCase()))return item;}}return null;}
  function createLeadPayload(data){const recommended_package=packageFor(data);const lead_score=scoreLead(data);return{name:data.name,phone:normalizePhone(data.phone),business_type:data.business_type,objective:data.objective,budget:data.budget,timeline:data.timeline,recommended_package,lead_score,lead_temperature:tempFor(lead_score),status:"NEW",notes:data.notes||"",source:"Aira",page_url:location.href,user_agent:navigator.userAgent};}
  window.RH_AIRA_LEAD_SYSTEM={BANK,initSupabase,normalizePhone,validPhone,scoreLead,packageFor,priceFor,tempFor,featuresFor,getLocalLeads,saveLead,createLeadPayload,matchFAQ};
})();
