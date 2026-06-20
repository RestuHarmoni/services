-- RH Lead Push Notification System v1.0
-- Run this in Supabase SQL Editor.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription_json jsonb not null,
  staff_id text,
  device_label text,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_active on public.push_subscriptions(active);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_select" on public.push_subscriptions;
create policy "push_subscriptions_select" on public.push_subscriptions for select to anon using (true);

drop policy if exists "push_subscriptions_insert" on public.push_subscriptions;
create policy "push_subscriptions_insert" on public.push_subscriptions for insert to anon with check (true);

drop policy if exists "push_subscriptions_update" on public.push_subscriptions;
create policy "push_subscriptions_update" on public.push_subscriptions for update to anon using (true) with check (true);

alter table public.leads add column if not exists last_push_sent_at timestamptz;
alter table public.leads add column if not exists push_reminder_count integer not null default 0;

create or replace function public.notify_new_lead_push()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-lead-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('lead_id', new.id, 'mode', 'new_lead')
  );
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists trg_notify_new_lead_push on public.leads;
create trigger trg_notify_new_lead_push
after insert on public.leads
for each row execute function public.notify_new_lead_push();

-- Reminder function. Schedule this every 5 minutes in Supabase Cron.
create or replace function public.send_unconverted_lead_push_reminders()
returns void
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-lead-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('mode', 'reminder')
  );
exception when others then
  null;
end;
$$;

-- Required once if using database webhooks/http calls:
-- create extension if not exists pg_net;
-- alter database postgres set app.settings.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';
-- alter database postgres set app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';

-- Optional Supabase Cron every 5 minutes:
-- select cron.schedule('rh-lead-push-reminder-5min', '*/5 * * * *', 'select public.send_unconverted_lead_push_reminders();');
