// Supabase Edge Function: send-lead-push
// No Telegram. Sends Web Push to all active browser/PWA subscriptions.
// Required secrets:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@restuharmoni.com';
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const STOP_STATUSES = new Set(['converted','prospect','qualified_prospect','archived','closed','lost','deleted']);

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
function activeLead(lead: any) { return !STOP_STATUSES.has(String(lead?.status || 'new').toLowerCase()); }
function leadBody(lead: any, reminder = false) {
  const name = lead?.name || 'Tanpa nama';
  const phone = lead?.phone || '-';
  const biz = lead?.business_type || lead?.objective || 'Sila follow up sekarang';
  return {
    title: reminder ? '🔔 Lead belum masuk Prospect' : '🚀 Lead Baru Masuk',
    body: `${name} • ${phone}\n${biz}`,
    icon: '/assets/rh-logo.png',
    badge: '/assets/rh-logo.png',
    tag: `rh-lead-${lead?.id || Date.now()}`,
    url: '/admin/leads.html',
    lead_id: lead?.id || null
  };
}
async function sendToAll(payload: any) {
  const { data: subs, error } = await supabase.from('push_subscriptions').select('*').eq('is_active', true);
  if (error) throw error;
  let success = 0, failed = 0;
  for (const sub of subs || []) {
    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify(payload));
      success++;
      await supabase.from('push_subscriptions').update({ last_success_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() }).eq('id', sub.id);
    } catch (err) {
      failed++;
      const status = (err as any)?.statusCode || 0;
      await supabase.from('push_subscriptions').update({ last_error: String((err as any)?.message || err).slice(0, 500), is_active: status === 410 || status === 404 ? false : sub.is_active, updated_at: new Date().toISOString() }).eq('id', sub.id);
    }
  }
  return { success, failed, total: (subs || []).length };
}
async function sendSingleLead(lead_id: string, push_type = 'new_lead') {
  const { data: lead, error } = await supabase.from('leads').select('*').eq('id', lead_id).maybeSingle();
  if (error) throw error;
  if (!lead || !activeLead(lead)) return { skipped: true, reason: 'lead not active' };
  const result = await sendToAll(leadBody(lead, push_type === 'reminder'));
  const now = new Date();
  const next = new Date(now.getTime() + 5 * 60 * 1000);
  await supabase.from('lead_push_logs').upsert({ lead_id, push_type: 'reminder', sent_count: 1, last_sent_at: now.toISOString(), next_send_at: next.toISOString(), updated_at: now.toISOString() }, { onConflict: 'lead_id,push_type' });
  return result;
}
Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response('ok');
    const body = await req.json().catch(() => ({}));
    if (body.mode === 'single' && body.lead_id) return json(await sendSingleLead(String(body.lead_id), body.push_type || 'new_lead'));
    if (body.mode === 'test') return json(await sendToAll({ title: '✅ RH Push Test', body: 'Push notification server berjaya dihantar.', icon: '/assets/rh-logo.png', badge: '/assets/rh-logo.png', tag: 'rh-server-test', url: '/admin/leads.html' }));
    return json({ ok: false, message: 'Use mode=single with lead_id, or mode=test' }, 400);
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String((err as any)?.message || err) }, 500);
  }
});
