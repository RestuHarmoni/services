// Supabase Edge Function: lead-push-reminder
// Schedule every 5 minutes. Sends reminders for active leads not converted to Prospect.
// Required secrets same as send-lead-push.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@restuharmoni.com', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);
const STOP = ['converted','prospect','qualified_prospect','archived','closed','lost','deleted'];
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }); }
function payload(lead: any) { return { title:'🔔 Lead belum masuk Prospect', body:`${lead.name || 'Tanpa nama'} • ${lead.phone || '-'}\nStatus: ${lead.status || 'new'} — sila convert ke Prospect`, icon:'/assets/rh-logo.png', badge:'/assets/rh-logo.png', tag:`rh-lead-${lead.id}`, renotify:true, requireInteraction:true, url:'/admin/leads.html', lead_id:lead.id }; }
async function pushAll(p: any) {
  const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('is_active', true);
  let success = 0, failed = 0;
  for (const sub of subs || []) {
    try { await webpush.sendNotification(sub.subscription, JSON.stringify(p)); success++; await supabase.from('push_subscriptions').update({last_success_at:new Date().toISOString(), last_error:null, updated_at:new Date().toISOString()}).eq('id', sub.id); }
    catch(e){ failed++; const status=(e as any)?.statusCode||0; await supabase.from('push_subscriptions').update({last_error:String((e as any)?.message||e).slice(0,500), is_active: status===410 || status===404 ? false : sub.is_active, updated_at:new Date().toISOString()}).eq('id', sub.id); }
  }
  return {success, failed, total:(subs||[]).length};
}
Deno.serve(async (_req) => {
  try {
    const now = new Date().toISOString();
    const { data: leads, error } = await supabase.from('leads').select('*').not('status','in',`(${STOP.join(',')})`).order('created_at', { ascending: true }).limit(50);
    if (error) throw error;
    let processed = 0;
    for (const lead of leads || []) {
      const { data: log } = await supabase.from('lead_push_logs').select('*').eq('lead_id', lead.id).eq('push_type','reminder').maybeSingle();
      if (log?.next_send_at && new Date(log.next_send_at).getTime() > Date.now()) continue;
      const result = await pushAll(payload(lead));
      const next = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      await supabase.from('lead_push_logs').upsert({ lead_id: lead.id, push_type:'reminder', sent_count: Number(log?.sent_count || 0) + 1, last_sent_at: now, next_send_at: next, updated_at: now }, { onConflict:'lead_id,push_type' });
      processed += result.total;
    }
    return json({ ok:true, active_leads:(leads||[]).length, notifications_attempted:processed });
  } catch (err) {
    console.error(err);
    return json({ ok:false, error:String((err as any)?.message || err) }, 500);
  }
});
