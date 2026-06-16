-- RH Admin V1 - Prospect Module
-- Run this in Supabase Beta before testing admin/prospects.html.

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  name text not null,
  phone text,
  email text,
  company text,
  business_type text,
  objective text,
  budget text,
  timeline text,
  recommended_package text,
  lead_score integer,
  lead_temperature text,
  domain_status text,
  hosting_status text,
  notes text,
  prospect_status text default 'new_prospect',
  sales_stage text default 'new_prospect',
  assigned_staff text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.prospects
add column if not exists lead_id uuid;
alter table public.prospects
add column if not exists name text;
alter table public.prospects
add column if not exists phone text;
alter table public.prospects
add column if not exists email text;
alter table public.prospects
add column if not exists company text;
alter table public.prospects
add column if not exists business_type text;
alter table public.prospects
add column if not exists objective text;
alter table public.prospects
add column if not exists budget text;
alter table public.prospects
add column if not exists timeline text;
alter table public.prospects
add column if not exists recommended_package text;
alter table public.prospects
add column if not exists lead_score integer;
alter table public.prospects
add column if not exists lead_temperature text;
alter table public.prospects
add column if not exists domain_status text;
alter table public.prospects
add column if not exists hosting_status text;
alter table public.prospects
add column if not exists notes text;
alter table public.prospects
add column if not exists prospect_status text default 'new_prospect';
alter table public.prospects
add column if not exists sales_stage text default 'new_prospect';
alter table public.prospects
add column if not exists assigned_staff text;
alter table public.prospects
add column if not exists created_at timestamptz default now();
alter table public.prospects
add column if not exists updated_at timestamptz default now();

create index if not exists idx_prospects_lead_id on public.prospects(lead_id);
create index if not exists idx_prospects_sales_stage on public.prospects(sales_stage);
create index if not exists idx_prospects_created_at on public.prospects(created_at desc);

alter table public.prospects enable row level security;

drop policy if exists "beta_read_prospects" on public.prospects;
create policy "beta_read_prospects"
on public.prospects
for select
to anon
using (true);

drop policy if exists "beta_insert_prospects" on public.prospects;
create policy "beta_insert_prospects"
on public.prospects
for insert
to anon
with check (true);

drop policy if exists "beta_update_prospects" on public.prospects;
create policy "beta_update_prospects"
on public.prospects
for update
to anon
using (true)
with check (true);

drop policy if exists "beta_delete_prospects" on public.prospects;
create policy "beta_delete_prospects"
on public.prospects
for delete
to anon
using (true);

-- Ensure related activity logs table exists for admin actions.
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

drop policy if exists "beta_read_activity_logs" on public.activity_logs;
create policy "beta_read_activity_logs"
on public.activity_logs
for select
to anon
using (true);

drop policy if exists "beta_insert_activity_logs" on public.activity_logs;
create policy "beta_insert_activity_logs"
on public.activity_logs
for insert
to anon
with check (true);
