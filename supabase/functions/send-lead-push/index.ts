import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@restuharmoni.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function unconvertedFilter(q:any){
  return q.not("status","in", "(converted,archived,closed,lost,deleted)");
}

serve(async (req) => {
  try {
    const body = await req.json().catch(()=>({}));
    const mode = body.mode || "reminder";
    let leads:any[] = [];
    if (body.lead_id) {
      const { data, error } = await supabase.from("leads").select("*").eq("id", body.lead_id).maybeSingle();
      if (error) throw error;
      if (data && !["converted","archived","closed","lost","deleted"].includes(String(data.status||"new").toLowerCase())) leads = [data];
    } else {
      const dueIso = new Date(Date.now() - 5*60*1000).toISOString();
      const { data, error } = await unconvertedFilter(
        supabase.from("leads").select("*").or(`last_push_sent_at.is.null,last_push_sent_at.lt.${dueIso}`).order("created_at", { ascending:false }).limit(10)
      );
      if (error) throw error;
      leads = data || [];
    }

    const { data: subs, error: subErr } = await supabase.from("push_subscriptions").select("id,subscription_json,endpoint").eq("active", true);
    if (subErr) throw subErr;

    let sent = 0;
    for (const lead of leads) {
      const title = mode === "new_lead" ? "🚀 Lead Baru Masuk" : "🚨 Lead Belum Jadi Prospek";
      const payload = JSON.stringify({
        title,
        body: `${lead.name || "Tanpa nama"} - ${lead.business_type || "Bisnes"}
${lead.phone || "-"} • ${lead.budget || lead.recommended_package || "Semak dashboard"}`,
        icon: "/assets/rh-logo.png",
        badge: "/assets/rh-logo.png",
        tag: `rh-lead-${lead.id}`,
        url: "/admin/leads.html",
        lead_id: lead.id
      });
      for (const sub of (subs || [])) {
        try { await webpush.sendNotification(sub.subscription_json, payload); sent++; }
        catch (err) {
          const status = (err as any)?.statusCode;
          if (status === 404 || status === 410) await supabase.from("push_subscriptions").update({active:false,updated_at:new Date().toISOString()}).eq("id", sub.id);
          console.error("push failed", status, err);
        }
      }
      await supabase.from("leads").update({last_push_sent_at:new Date().toISOString(), push_reminder_count:(Number(lead.push_reminder_count||0)+1)}).eq("id", lead.id);
    }
    return new Response(JSON.stringify({ ok:true, mode, leads:leads.length, sent }), { headers:{"Content-Type":"application/json"} });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok:false, error:String((err as Error).message || err) }), { status:500, headers:{"Content-Type":"application/json"} });
  }
});
