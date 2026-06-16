-- RH ADMIN V1 PHASE 1 LEADS FIX
-- Safe to run after public beta tables. Fixes admin policies, password hash, and leads/prospects permissions.

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  name text,
  phone text,
  email text,
  company text,
  business_type text,
  domain_status text,
  hosting_status text,
  notes text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id text,
  action text,
  message text,
  staff_id text,
  created_at timestamptz default now()
);

alter table public.prospects enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "beta_read_prospects" on public.prospects;
create policy "beta_read_prospects" on public.prospects for select to anon using (true);
drop policy if exists "beta_write_prospects" on public.prospects;
create policy "beta_write_prospects" on public.prospects for all to anon using (true) with check (true);

drop policy if exists "beta_read_activity_logs" on public.activity_logs;
create policy "beta_read_activity_logs" on public.activity_logs for select to anon using (true);
drop policy if exists "beta_write_activity_logs" on public.activity_logs;
create policy "beta_write_activity_logs" on public.activity_logs for all to anon using (true) with check (true);

-- Allow admin dashboard to read/update leads in beta. Public insert policy can stay as already created.
drop policy if exists "beta_read_leads_admin" on public.leads;
create policy "beta_read_leads_admin" on public.leads for select to anon using (true);
drop policy if exists "beta_update_leads_admin" on public.leads;
create policy "beta_update_leads_admin" on public.leads for update to anon using (true) with check (true);

-- Correct SHA-256 for password: rh123456
update public.staff_users
set password_hash = '0b0f01a7a09e721f768a5a373f1e0deabd0029e49275b913ac8d86d1f91b42c8',
    status = 'active',
    role = 'SUPER_ADMIN',
    full_name = 'Super Admin'
where staff_id = 'SUPER001';
