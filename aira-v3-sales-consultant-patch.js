(function(){
  const V3_QUESTION_BANK = {"version": "v11.0-package-template-linking-aira-v3-sales-consultant", "assistantName": "Aira", "positioning": "AI Website Consultant", "intro": ["👋 Hai, saya <strong>Aira</strong>.", "Saya boleh bantu cadangkan website yang sesuai untuk bisnes anda dalam masa kurang 1 minit."], "steps": [{"key": "business_type", "question": "Apakah jenis bisnes anda?", "type": "choice", "required": true, "options": ["Servis", "Produk", "Restoran", "Event", "Hartanah", "Lain-lain"]}, {"key": "domain_status", "question": "Adakah anda sudah mempunyai domain?", "type": "choice", "required": false, "options": ["Ya", "Belum", "Tidak Pasti"]}, {"key": "hosting_status", "question": "Adakah anda sudah mempunyai hosting?", "type": "choice", "required": false, "options": ["Ya", "Belum", "Tidak Pasti"]}, {"key": "objective", "question": "Apakah objektif utama website anda?", "type": "choice", "required": true, "options": ["Dapatkan Lead", "Profil Syarikat", "Jual Produk", "Booking", "SEO Google"]}, {"key": "budget", "question": "Budget anggaran?", "type": "choice", "required": true, "options": ["RM799 (RH Basic)", "RM1999 (RH Growth)", "RM2999 (RH Ecosystem)", "RM3000+ (RH Enterprise)", "Tidak Pasti"]}, {"key": "timeline", "question": "Bila anda mahu website mula siap atau dilancarkan?", "type": "choice", "required": true, "options": ["Segera", "1–2 minggu", "Dalam 1 bulan", "Belum pasti"]}, {"key": "name", "question": "Boleh saya tahu nama anda?", "type": "input", "input": true, "placeholder": "Contoh: Ahmad", "required": true}, {"key": "phone", "question": "Nombor WhatsApp untuk team kami hubungi?", "type": "input", "input": true, "placeholder": "Contoh: 0123456789", "required": true, "validation": "phone"}], "packages": {"RH Basic": {"price": "RM799", "maintenance": "RM79/bulan", "templateCount": 1, "bestFor": ["Startup", "Personal web", "Bisnes kecil", "Profil ringkas"], "features": ["One-page / basic profile website", "Mobile responsive", "Lead form ringkas", "WhatsApp CTA", "SEO asas", "Google-ready structure"], "templateUrl": "/pakej/rh-basic/"}, "RH Growth": {"price": "RM1999", "maintenance": "RM129/bulan", "templateCount": 10, "bestFor": ["Bisnes servis", "Lead generation", "Portfolio", "Blog SEO"], "features": ["Multi-page website", "AI Chatbot Aira", "Lead Capture System", "Service / Product Listing", "Blog / Artikel", "Portfolio / Gallery", "SEO asas"], "templateUrl": "/pakej/rh-growth/"}, "RH Ecosystem": {"price": "RM2999", "maintenance": "RM249/bulan", "templateCount": 10, "bestFor": ["Syarikat berkembang", "Multi servis", "Admin dashboard", "AI sales funnel"], "features": ["Company Profile + Service Website", "Advanced AI Chatbot", "Blog CMS", "Dashboard Basic", "Lead Management Ready", "Analytics-ready structure", "Multi Website Structure"], "templateUrl": "/pakej/rh-ecosystem/"}, "RH Enterprise": {"price": "Custom", "maintenance": "Ikut scope", "templateCount": 0, "bestFor": ["Custom system", "Portal", "CRM", "Multi-branch"], "features": ["Custom quotation", "Portal / dashboard", "Automation flow", "Integration planning", "Advanced workflow"], "templateUrl": "/#aira-popup"}}};
  const V3_FAQ_BANK = {"version": "v11.0-package-template-linking-aira-v3-sales-consultant", "quickActions": ["Lihat Pakej", "Harga Pakej RH", "Lihat Contoh Website", "Dapatkan Cadangan"], "faq": [{"topic": "harga", "triggers": ["harga", "kos", "price", "pakej", "package", "bayaran", "berapa", "lihat pakej"], "answer": "Kami ada 4 pilihan utama:<br><br><strong>RH Basic</strong> — RM799 + maintenance RM79/bulan<br><strong>RH Growth</strong> — RM1999 + maintenance RM129/bulan<br><strong>RH Ecosystem</strong> — RM2999 + maintenance RM249/bulan<br><strong>RH Enterprise</strong> — Custom quotation.<br><br>Aira boleh cadangkan pakej berdasarkan jenis bisnes, domain, hosting, objektif dan budget anda."}, {"topic": "basic", "triggers": ["basic", "rm799", "799", "starter murah", "industri kecil", "personal"], "answer": "<strong>RH Basic RM799</strong> sesuai untuk personal web, bisnes kecil, profil ringkas dan permulaan digital. Maintenance bermula RM79/bulan."}, {"topic": "growth", "triggers": ["growth", "rm1999", "1999"], "answer": "<strong>RH Growth RM1999</strong> sesuai untuk bisnes servis yang mahu dapatkan lead, paparkan portfolio, servis, artikel dan struktur website lebih lengkap."}, {"topic": "ecosystem", "triggers": ["ecosystem", "rm2999", "2999"], "answer": "<strong>RH Ecosystem RM2999</strong> sesuai untuk syarikat yang mahu website + Aira + blog CMS + dashboard basic + lead management."}, {"topic": "enterprise", "triggers": ["enterprise", "custom", "3000", "rm3000", "portal", "crm", "system"], "answer": "<strong>RH Enterprise</strong> ialah quotation custom untuk portal, dashboard, CRM, multi-branch, automation atau sistem khas."}, {"topic": "tempoh", "triggers": ["lama", "siap", "tempoh", "berapa hari", "duration", "ready"], "answer": "Kebanyakan website boleh siap dalam 3–7 hari bekerja selepas bahan lengkap diterima. Projek custom mungkin mengambil masa lebih lama."}, {"topic": "domain", "triggers": ["domain", ".com", ".my", "nama website"], "answer": "Jika belum ada domain, RH boleh bantu setup. Jika sudah ada domain, kami boleh bantu semak DNS dan sambungkan kepada website."}, {"topic": "hosting", "triggers": ["hosting", "server", "online", "publish"], "answer": "Jika belum ada hosting, RH boleh bantu urus setup. Jika sudah ada hosting sendiri, kami akan semak kesesuaian sebelum deployment."}, {"topic": "seo", "triggers": ["seo", "google", "ranking", "search", "carian"], "answer": "Website disediakan dengan SEO asas seperti meta title, meta description, heading structure, sitemap, mobile responsive dan struktur Google-ready."}, {"topic": "contoh", "triggers": ["contoh", "demo", "portfolio", "template", "sample"], "answer": "Anda boleh lihat contoh website mengikut pakej di halaman pakej RH. Aira juga boleh cadangkan pakej selepas menjawab beberapa soalan ringkas."}, {"topic": "maintenance", "triggers": ["maintenance", "support", "jaga website", "kemaskini bulanan", "update website"], "answer": "Maintenance bergantung kepada pakej. RH Basic bermula RM79/bulan, RH Growth RM129/bulan dan RH Ecosystem RM249/bulan."}]};

  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function applyAiraV3(){
    const SYS = window.RH_AIRA_LEAD_SYSTEM;
    if(!SYS) return false;

    SYS.DEFAULT_QUESTION_BANK && Object.assign(SYS.DEFAULT_QUESTION_BANK, clone(V3_QUESTION_BANK));
    SYS.DEFAULT_FAQ_BANK && Object.assign(SYS.DEFAULT_FAQ_BANK, clone(V3_FAQ_BANK));

    SYS.BANK = SYS.BANK || {};
    SYS.BANK.version = V3_QUESTION_BANK.version;
    SYS.BANK.assistantName = "Aira";
    SYS.BANK.positioning = "AI Website Consultant";
    SYS.BANK.intro = clone(V3_QUESTION_BANK.intro);
    SYS.BANK.steps = clone(V3_QUESTION_BANK.steps);
    SYS.BANK.businessOptions = clone(V3_QUESTION_BANK.steps[0].options);
    SYS.BANK.objectiveOptions = clone(V3_QUESTION_BANK.steps[3].options);
    SYS.BANK.budgetOptions = clone(V3_QUESTION_BANK.steps[4].options);
    SYS.BANK.timelineOptions = clone(V3_QUESTION_BANK.steps[5].options);
    SYS.BANK.packages = clone(V3_QUESTION_BANK.packages);
    SYS.BANK.quickActions = clone(V3_FAQ_BANK.quickActions);
    SYS.BANK.faq = clone(V3_FAQ_BANK.faq);

    SYS.scoreLead = function(data){
      const budget=String((data&&data.budget)||"");
      let score=45;
      if(budget.includes("RM3000") || budget.includes("Enterprise")) score=100;
      else if(budget.includes("2999") || budget.includes("Ecosystem")) score=90;
      else if(budget.includes("1999") || budget.includes("Growth")) score=70;
      else if(budget.includes("799") || budget.includes("Basic")) score=40;
      if(String(data&&data.timeline||"").toLowerCase().includes("segera")) score+=5;
      if(String(data&&data.objective||"").toLowerCase().includes("seo")) score+=5;
      return Math.min(score,100);
    };

    SYS.packageFor = function(data){
      const budget=String((data&&data.budget)||"");
      const obj=String((data&&data.objective)||"").toLowerCase();
      if(budget.includes("RM3000") || budget.includes("Enterprise")) return "RH Enterprise";
      if(budget.includes("2999") || budget.includes("Ecosystem")) return "RH Ecosystem";
      if(budget.includes("1999") || budget.includes("Growth")) return "RH Growth";
      if(budget.includes("799") || budget.includes("Basic")) return "RH Basic";
      if(obj.includes("jual produk") || obj.includes("booking") || obj.includes("seo")) return "RH Growth";
      return "RH Basic";
    };

    SYS.priceFor = function(pkg){
      return (SYS.BANK.packages[pkg] && SYS.BANK.packages[pkg].price) || (pkg==="RH Enterprise"?"Custom":"RM799");
    };
    SYS.maintenanceFor = function(pkg){
      return (SYS.BANK.packages[pkg] && SYS.BANK.packages[pkg].maintenance) || "Ikut scope";
    };
    SYS.featuresFor = function(pkg){
      return (SYS.BANK.packages[pkg] && SYS.BANK.packages[pkg].features) || [];
    };
    SYS.tempFor = function(score){
      score=Number(score||0);
      return score>=85?"HOT":score>=65?"WARM":"COLD";
    };
    SYS.matchFAQ = function(input){
      const q=String(input||"").toLowerCase();
      for(const item of (SYS.BANK.faq||[])){
        for(const trig of (item.triggers||[])){
          if(q.includes(String(trig).toLowerCase())) return item;
        }
      }
      return null;
    };
    SYS.createLeadPayload = function(data){
      data=data||{};
      const recommended_package=SYS.packageFor(data);
      const lead_score=SYS.scoreLead(data);
      const answers=SYS.buildAnswerSnapshot ? SYS.buildAnswerSnapshot(data) : [];
      const compact=answers.map(a=>`${a.question}: ${a.answer}`).join(" | ");
      const notes=[data.notes||"",compact?"Aira Answers: "+compact:""].filter(Boolean).join(" | ");
      return {
        name:data.name,
        phone:SYS.normalizePhone(data.phone),
        business_type:data.business_type,
        domain_status:data.domain_status,
        hosting_status:data.hosting_status,
        objective:data.objective,
        budget:data.budget,
        timeline:data.timeline,
        recommended_package,
        lead_score,
        lead_temperature:SYS.tempFor(lead_score),
        status:"NEW",
        notes,
        source:"Aira V3",
        page_url:location.href,
        user_agent:navigator.userAgent,
        answers
      };
    };

    try{
      localStorage.setItem("rh_aira_question_bank", JSON.stringify(V3_QUESTION_BANK));
      localStorage.setItem("rh_aira_faq_bank", JSON.stringify(V3_FAQ_BANK));
    }catch(e){}

    return true;
  }

  function wrapRemote(){
    const SYS = window.RH_AIRA_LEAD_SYSTEM;
    if(!SYS || SYS.__airaV3Wrapped) return;
    const original = SYS.loadRemoteBank;
    SYS.loadRemoteBank = async function(){
      let res={ok:false,source:"aira-v3"};
      if(typeof original === "function"){
        try{ res = await original.apply(SYS, arguments); }catch(e){ console.warn("Aira remote bank skipped:", e); }
      }
      applyAiraV3();
      return res;
    };
    SYS.__airaV3Wrapped = true;
    applyAiraV3();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", wrapRemote);
  else wrapRemote();

  window.RH_AIRA_V3_APPLY = applyAiraV3;
})();
