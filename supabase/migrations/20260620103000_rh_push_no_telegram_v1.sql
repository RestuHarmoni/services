-- RH Push Notification v1 (Tanpa Telegram)
-- Run di Supabase SQL Editor.

create extension if not exists pg_net with schema extensions;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription jsonb not null,
  staff_id text,
  device_label text,
  user_agent text,
  is_active boolean not null default true,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_active on public.push_subscriptions(is_active);

create table if not exists public.lead_push_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  push_type text not null default 'new_lead',
  sent_count integer not null default 0,
  last_sent_at timestamptz,
  next_send_at timestamptz,
  stopped_at timestamptz,
  stop_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(lead_id, push_type)
);

create index if not exists idx_lead_push_logs_next on public.lead_push_logs(next_send_at, stopped_at);

alter table public.push_subscriptions enable row level security;
alter table public.lead_push_logs enable row level security;

drop policy if exists "Admin can read push subscriptions" on public.push_subscriptions;
drop policy if exists "Admin can insert push subscriptions" on public.push_subscriptions;
drop policy if exists "Admin can update push subscriptions" on public.push_subscriptions;
create policy "Admin can read push subscriptions" on public.push_subscriptions for select using (true);
create policy "Admin can insert push subscriptions" on public.push_subscriptions for insert with check (true);
create policy "Admin can update push subscriptions" on public.push_subscriptions for update using (true) with check (true);

drop policy if exists "Admin can read lead push logs" on public.lead_push_logs;
drop policy if exists "Service can manage lead push logs" on public.lead_push_logs;
create policy "Admin can read lead push logs" on public.lead_push_logs for select using (true);
create policy "Service can manage lead push logs" on public.lead_push_logs for all using (true) with check (true);

-- Optional immediate trigger via pg_net. Edit placeholders before enabling.
-- 1) Deploy Edge Function send-lead-push.
-- 2) In Supabase Vault, store:
--    select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-lead-push', 'rh_edge_send_lead_push_url');
--    select vault.create_secret('YOUR_SUPABASE_SERVICE_ROLE_KEY', 'rh_service_role_key');
-- 3) Uncomment function + trigger below.

-- create or replace function public.rh_notify_new_lead_push()
-- returns trigger
-- language plpgsql
-- security definer
-- as $$
-- declare
--   fn_url text;
--   service_key text;
-- begin
--   select decrypted_secret into fn_url from vault.decrypted_secrets where name = 'rh_edge_send_lead_push_url' limit 1;
--   select decrypted_secret into service_key from vault.decrypted_secrets where name = 'rh_service_role_key' limit 1;
--   perform net.http_post(
--     url := fn_url,
--     headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || service_key),
--     body := jsonb_build_object('mode','single','lead_id',new.id,'push_type','new_lead')
--   );
--   return new;
-- end;
-- $$;
-- drop trigger if exists trg_rh_notify_new_lead_push on public.leads;
-- create trigger trg_rh_notify_new_lead_push after insert on public.leads for each row execute function public.rh_notify_new_lead_push();
