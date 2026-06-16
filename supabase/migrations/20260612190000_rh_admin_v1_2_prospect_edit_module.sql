-- RH Admin V1.2 - Prospect Edit Module
-- Run this in Supabase Beta before testing Prospect Edit.

alter table public.prospects add column if not exists follow_up_date date;
alter table public.prospects add column if not exists updated_at timestamptz default now();
alter table public.prospects add column if not exists domain_status text;
alter table public.prospects add column if not exists hosting_status text;
alter table public.prospects add column if not exists assigned_staff text;

-- Ensure Data Review stage is visible for corrupted/test data without breaking pipeline.
update public.prospects
set sales_stage = coalesce(nullif(sales_stage,''),'new_prospect'),
    prospect_status = coalesce(nullif(prospect_status,''),'new_prospect'),
    updated_at = now()
where sales_stage is null or prospect_status is null;

-- Open beta RLS for update testing. Tighten this before production.
alter table public.prospects enable row level security;

drop policy if exists "beta_update_prospects" on public.prospects;
create policy "beta_update_prospects"
on public.prospects
for update
to anon
using (true)
with check (true);

-- Activity log support for edit actions.
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id text,
  action text,
  message text,
  staff_id text,
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

drop policy if exists "beta_insert_activity_logs" on public.activity_logs;
create policy "beta_insert_activity_logs"
on public.activity_logs
for insert
to anon
with check (true);
