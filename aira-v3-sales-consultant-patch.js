(function(){
  const V3_QUESTION_BANK = {"version": "v1.3.8-aira-knowledge-bank-sales-question-flow", "assistantName": "Aira", "positioning": "AI Website Consultant", "intro": ["👋 Hai, saya <strong>Aira</strong>.", "Saya akan tanya beberapa soalan ringkas untuk cadangkan pakej website RH yang paling sesuai."], "steps": [{"key": "business_type", "question": "Apakah jenis bisnes anda?", "type": "choice", "required": true, "options": ["Servis", "Produk", "Restoran / F&B", "Event / Rental", "Hartanah", "Homestay / Hotel", "Kereta Sewa", "Klinik / Profesional", "Kontraktor / Renovasi", "Company Profile", "E-commerce / Katalog", "Custom System / Portal", "Lain-lain"]}, {"key": "domain_status", "question": "Adakah anda sudah mempunyai domain?", "type": "choice", "required": false, "options": ["Ya, sudah ada domain", "Belum ada domain", "Tidak pasti / perlu semak"]}, {"key": "hosting_status", "question": "Adakah anda sudah mempunyai hosting?", "type": "choice", "required": false, "options": ["Ya, sudah ada hosting", "Belum ada hosting", "Tidak pasti / perlu semak"]}, {"key": "website_status", "question": "Adakah anda sudah ada website sekarang?", "type": "choice", "required": false, "options": ["Belum ada website", "Ada, tetapi mahu upgrade", "Ada landing page sahaja", "Tidak pasti"]}, {"key": "objective", "question": "Apakah objektif utama website anda?", "type": "choice", "required": true, "options": ["Dapatkan Lead", "Profil Syarikat", "Jual Produk / Katalog", "Booking / Tempahan", "SEO Google", "Dashboard / Sistem", "Ecosystem Digital Lengkap"]}, {"key": "feature_need", "question": "Fungsi apa yang anda paling perlukan?", "type": "choice", "required": false, "options": ["Website basic + WhatsApp", "AI Chatbot Aira", "Blog / Artikel SEO", "Service / Product Listing", "Dashboard Basic", "Payment / Invoice", "Client Portal / Sistem Custom", "Belum pasti"]}, {"key": "budget", "question": "Budget anggaran anda?", "type": "choice", "required": true, "options": ["RM799 (RH Basic)", "RM1999 (RH Growth)", "RM2999 (RH Ecosystem)", "RM3000+ (RH Enterprise)", "Tidak Pasti"]}, {"key": "timeline", "question": "Bila anda mahu website mula siap atau dilancarkan?", "type": "choice", "required": true, "options": ["Segera", "1–2 minggu", "Dalam 1 bulan", "Belum pasti"]}, {"key": "content_ready", "question": "Bahan seperti logo, gambar dan teks sudah ada?", "type": "choice", "required": false, "options": ["Sudah lengkap", "Ada sebahagian", "Belum ada", "Perlu bantuan susun content"]}, {"key": "name", "question": "Boleh saya tahu nama anda?", "type": "input", "input": true, "placeholder": "Contoh: Ahmad", "required": true}, {"key": "phone", "question": "Nombor WhatsApp untuk team kami hubungi?", "type": "input", "input": true, "placeholder": "Contoh: 0123456789", "required": true, "validation": "phone"}, {"key": "email", "question": "Email untuk proposal / quotation?", "type": "input", "input": true, "placeholder": "Contoh: nama@email.com", "required": false, "validation": "email"}], "packages": {"RH Basic": {"price": "RM799", "maintenance": "RM79/bulan", "bestFor": ["Bisnes kecil", "Personal brand", "Profil ringkas", "Baru mula online"], "features": ["Website asas / one-page", "Mobile responsive", "WhatsApp CTA", "Lead form ringkas", "SEO asas", "Struktur Google-ready"], "templateUrl": "/pakej/rh-basic/"}, "RH Growth": {"price": "RM1999", "maintenance": "RM129/bulan", "bestFor": ["Bisnes servis", "Lead generation", "Portfolio", "Blog SEO", "Listing servis / produk"], "features": ["Multi-page website", "AI Chatbot Aira", "Lead Capture System", "Service / Product Listing", "Blog / Artikel", "Portfolio / Gallery", "SEO asas"], "templateUrl": "/pakej/rh-growth/"}, "RH Ecosystem": {"price": "RM2999", "maintenance": "RM249/bulan", "bestFor": ["Syarikat berkembang", "Multi servis", "Admin dashboard", "Sales funnel", "Ecosystem digital"], "features": ["Company profile + service website", "Advanced AI Chatbot", "Blog CMS", "Dashboard Basic", "Lead Management Ready", "Analytics-ready structure", "Multi Website Structure"], "templateUrl": "/pakej/rh-ecosystem/"}, "RH Enterprise": {"price": "Custom", "maintenance": "Custom", "bestFor": ["Portal", "CRM", "Custom system", "Multi-branch", "Automation"], "features": ["Custom quotation", "Portal / dashboard", "Automation flow", "Integration planning", "Advanced workflow", "Custom scope"], "templateUrl": "/#aira-popup"}}, "recommendationRules": {"basic": ["RM799", "Basic", "Belum ada website", "Website basic + WhatsApp", "Profil Syarikat"], "growth": ["RM1999", "Growth", "Jual Produk / Katalog", "Booking / Tempahan", "Blog / Artikel SEO", "AI Chatbot Aira", "Service / Product Listing", "SEO Google"], "ecosystem": ["RM2999", "Ecosystem", "Dashboard Basic", "Payment / Invoice", "Ecosystem Digital Lengkap", "Homestay / Hotel", "Kereta Sewa", "Event / Rental", "E-commerce / Katalog"], "enterprise": ["RM3000+", "Enterprise", "Dashboard / Sistem", "Client Portal / Sistem Custom", "Custom System / Portal"]}};
  const V3_FAQ_BANK = {"version": "v1.3.8-aira-knowledge-bank-sales-question-flow", "quickActions": ["Dapatkan Cadangan", "Harga Pakej RH", "Beza Pakej", "Domain & Hosting", "Maintenance", "Tempoh Siap", "SEO Google", "AI Chatbot Aira"], "faq": [{"topic": "harga", "triggers": ["harga", "kos", "price", "pakej", "package", "bayaran", "berapa", "lihat pakej"], "answer": "Kami ada 4 pilihan utama:<br><br><strong>RH Basic</strong> — RM799 + maintenance RM79/bulan<br><strong>RH Growth</strong> — RM1999 + maintenance RM129/bulan<br><strong>RH Ecosystem</strong> — RM2999 + maintenance RM249/bulan<br><strong>RH Enterprise</strong> — Custom quotation.<br><br>Aira boleh cadangkan pakej berdasarkan jenis bisnes, domain, hosting, objektif dan budget anda."}, {"topic": "basic", "triggers": ["basic", "rm799", "799", "murah", "permulaan", "personal"], "answer": "<strong>RH Basic RM799</strong> sesuai untuk bisnes kecil, personal brand atau profil ringkas yang mahu mula ada website rasmi. Maintenance RM79/bulan."}, {"topic": "growth", "triggers": ["growth", "rm1999", "1999", "lead", "blog", "artikel", "servis"], "answer": "<strong>RH Growth RM1999</strong> sesuai untuk bisnes servis yang mahu dapatkan lead, paparkan servis/produk, portfolio dan artikel SEO. Maintenance RM129/bulan."}, {"topic": "ecosystem", "triggers": ["ecosystem", "rm2999", "2999", "dashboard", "ekosistem", "multi"], "answer": "<strong>RH Ecosystem RM2999</strong> sesuai untuk syarikat yang perlukan website lebih lengkap: Aira, blog CMS, dashboard basic dan lead management. Maintenance RM249/bulan."}, {"topic": "enterprise", "triggers": ["enterprise", "custom", "3000", "rm3000", "portal", "crm", "system", "sistem"], "answer": "<strong>RH Enterprise</strong> ialah quotation custom untuk portal, dashboard, CRM, multi-branch, automation atau sistem khas."}, {"topic": "beza_pakej", "triggers": ["beza", "compare", "perbezaan", "mana sesuai"], "answer": "Secara ringkas: <strong>RH Basic</strong> untuk mula online, <strong>RH Growth</strong> untuk lead + content + listing, <strong>RH Ecosystem</strong> untuk website lengkap dengan dashboard dan funnel, manakala <strong>Enterprise</strong> untuk sistem custom."}, {"topic": "tempoh", "triggers": ["lama", "siap", "tempoh", "berapa hari", "duration", "ready"], "answer": "Kebanyakan website boleh siap dalam 3–7 hari bekerja selepas bahan lengkap diterima. Projek custom atau Enterprise mungkin mengambil masa lebih lama mengikut scope."}, {"topic": "domain", "triggers": ["domain", ".com", ".my", "nama website", "dns"], "answer": "Jika belum ada domain, RH boleh bantu setup. Jika sudah ada domain, kami boleh bantu semak DNS dan sambungkan kepada website."}, {"topic": "hosting", "triggers": ["hosting", "server", "online", "publish", "cpanel"], "answer": "Jika belum ada hosting, RH boleh bantu urus setup. Jika sudah ada hosting sendiri, kami akan semak kesesuaian hosting sebelum deployment."}, {"topic": "seo", "triggers": ["seo", "google", "ranking", "search", "carian", "google business"], "answer": "Website disediakan dengan SEO asas seperti meta title, meta description, heading structure, sitemap, mobile responsive dan struktur Google-ready."}, {"topic": "aira", "triggers": ["aira", "chatbot", "ai", "bot", "auto reply"], "answer": "Aira ialah AI website consultant / chatbot yang bantu jawab soalan pelanggan, kumpul maklumat lead dan cadangkan pakej berdasarkan jawapan pelanggan."}, {"topic": "maintenance", "triggers": ["maintenance", "support", "jaga website", "kemaskini bulanan", "update website", "bulanan"], "answer": "Maintenance bergantung kepada pakej: RH Basic RM79/bulan, RH Growth RM129/bulan dan RH Ecosystem RM249/bulan. Ia meliputi pemantauan asas, support dan kemaskini kecil mengikut pakej."}, {"topic": "payment", "triggers": ["deposit", "bayar", "ansuran", "invoice", "quotation", "sebut harga"], "answer": "Biasanya proses bermula dengan cadangan pakej, quotation, invoice dan bayaran mengikut terma yang dipersetujui. Untuk Enterprise, quotation bergantung kepada scope."}, {"topic": "content", "triggers": ["logo", "gambar", "content", "teks", "copywriting", "bahan"], "answer": "Jika bahan seperti logo, gambar dan teks belum lengkap, RH boleh bantu susun struktur content asas supaya website masih boleh dimulakan dengan kemas."}, {"topic": "facebook", "triggers": ["facebook", "fb", "instagram", "tiktok", "social media"], "answer": "Media sosial bagus untuk promosi harian. Website pula menjadi pusat rujukan rasmi yang lebih mudah dipercayai dan boleh dihubungkan dengan SEO Google, Aira dan lead form."}]};

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
      data=data||{};
      const budget=String(data.budget||"");
      const obj=String(data.objective||"").toLowerCase();
      const feature=String(data.feature_need||"").toLowerCase();
      const biz=String(data.business_type||"").toLowerCase();
      let score=45;
      if(budget.includes("RM3000") || budget.includes("Enterprise")) score=95;
      else if(budget.includes("2999") || budget.includes("Ecosystem")) score=85;
      else if(budget.includes("1999") || budget.includes("Growth")) score=70;
      else if(budget.includes("799") || budget.includes("Basic")) score=48;
      if(String(data.timeline||"").toLowerCase().includes("segera")) score+=7;
      if(obj.includes("seo") || obj.includes("booking") || obj.includes("dashboard") || obj.includes("sistem")) score+=7;
      if(feature.includes("dashboard") || feature.includes("payment") || feature.includes("client portal")) score+=10;
      if(biz.includes("custom") || biz.includes("portal") || biz.includes("e-commerce")) score+=8;
      if(String(data.domain_status||"").toLowerCase().includes("ya")) score+=3;
      if(String(data.hosting_status||"").toLowerCase().includes("ya")) score+=2;
      return Math.min(score,100);
    };

    SYS.packageFor = function(data){
      data=data||{};
      const budget=String(data.budget||"");
      const obj=String(data.objective||"").toLowerCase();
      const feature=String(data.feature_need||"").toLowerCase();
      const biz=String(data.business_type||"").toLowerCase();
      if(budget.includes("RM3000") || budget.includes("Enterprise") || obj.includes("sistem") || feature.includes("client portal") || biz.includes("custom")) return "RH Enterprise";
      if(budget.includes("2999") || budget.includes("Ecosystem") || obj.includes("ecosystem") || feature.includes("dashboard") || feature.includes("payment") || biz.includes("e-commerce") || biz.includes("event") || biz.includes("homestay") || biz.includes("kereta")) return "RH Ecosystem";
      if(budget.includes("1999") || budget.includes("Growth") || obj.includes("jual produk") || obj.includes("booking") || obj.includes("seo") || feature.includes("blog") || feature.includes("listing") || feature.includes("chatbot")) return "RH Growth";
      if(budget.includes("799") || budget.includes("Basic")) return "RH Basic";
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
        email:data.email||null,
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
        source:"Aira V3.8",
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
