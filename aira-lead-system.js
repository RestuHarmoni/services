
(function(){
  const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  const cfg = window.RH_SUPABASE_CONFIG || {};
  let supabaseClient = null;

  function loadSupabase(){
    return new Promise((resolve)=>{
      if(window.supabase){ resolve(true); return; }
      const s=document.createElement('script');
      s.src=SUPABASE_CDN;
      s.onload=()=>resolve(true);
      s.onerror=()=>resolve(false);
      document.head.appendChild(s);
    });
  }

  async function initSupabase(){
    if(supabaseClient) return supabaseClient;
    if(!cfg.url || !cfg.anonKey || cfg.url.includes("PASTE_")) return null;
    const ok = await loadSupabase();
    if(!ok || !window.supabase) return null;
    supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
    return supabaseClient;
  }

  function scoreLead(data){
    let score=40;
    if(data.budget==="RM2000+") score+=30;
    else if(data.budget==="RM1000 – RM2000") score+=20;
    else if(data.budget==="RM699 – RM999") score+=10;

    if(data.timeline==="Segera") score+=25;
    else if(data.timeline==="1–2 Minggu") score+=15;
    else if(data.timeline==="1 Bulan") score+=8;

    if(["Corporate","Klinik","Hartanah"].includes(data.business_type)) score+=10;
    if(["Booking","Company Profile","Jual Produk"].includes(data.objective)) score+=8;

    return Math.min(score,100);
  }

  function packageFor(data){
    if(data.budget==="RM2000+") return "RH Pro";
    if(data.budget==="RM1000 – RM2000") return "RH Business";
    if(data.objective==="Custom") return "Custom";
    if(data.business_type==="Corporate" || data.business_type==="Klinik") return "RH Pro";
    if(["Homestay","Kereta Sewa","Kedai Makan","Kontraktor","Butik"].includes(data.business_type)) return "RH Business";
    return "RH Starter";
  }

  function tempFor(score){
    if(score>=80) return "HOT";
    if(score>=60) return "WARM";
    return "COLD";
  }

  function getLocalLeads(){
    try{return JSON.parse(localStorage.getItem("rh_leads")||"[]");}catch(e){return [];}
  }

  function saveLocalLead(lead){
    const list=getLocalLeads();
    list.unshift({...lead,id:"LOCAL-"+Date.now(),created_at:new Date().toISOString()});
    localStorage.setItem("rh_leads",JSON.stringify(list));
  }

  async function saveLead(lead){
    const client = await initSupabase();
    if(!client){
      saveLocalLead(lead);
      return {ok:true, mode:"local"};
    }
    const {error} = await client.from("leads").insert([lead]);
    if(error){
      saveLocalLead(lead);
      return {ok:false, mode:"local", error:error.message};
    }
    return {ok:true, mode:"supabase"};
  }

  window.RH_AIRA_LEAD_SYSTEM = {
    scoreLead, packageFor, tempFor, saveLead, getLocalLeads, initSupabase,
    createLeadPayload(data){
      const recommended_package=packageFor(data);
      const lead_score=scoreLead(data);
      const lead_temperature=tempFor(lead_score);
      return {
        name:data.name,
        phone:data.phone,
        business_type:data.business_type,
        objective:data.objective,
        budget:data.budget,
        timeline:data.timeline,
        recommended_package,
        lead_score,
        lead_temperature,
        status:"NEW",
        source:"Aira",
        page_url:location.href,
        user_agent:navigator.userAgent
      };
    }
  };
})();
