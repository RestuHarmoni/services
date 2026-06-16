-- RH Admin V1.3 - Lead Management Upgrade
-- Edit Lead, Soft Delete, Force Convert, duplicate warning support, and lead activity foundation.

alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists company text;
alter table public.leads add column if not exists domain_status text;
alter table public.leads add column if not exists hosting_status text;
alter table public.leads add column if not exists updated_at timestamptz default now();
alter table public.leads add column if not exists deleted_at timestamptz;
alter table public.leads add column if not exists deleted_by text;

create table if not exists public.lead_activity_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  action text,
  message text,
  staff_id text,
  created_at timestamptz default now()
);

alter table public.leads enable row level security;
alter table public.lead_activity_logs enable row level security;

drop policy if exists "beta_read_leads_admin" on public.leads;
create policy "beta_read_leads_admin"
on public.leads
for select
to anon
using (true);

drop policy if exists "beta_insert_leads_admin" on public.leads;
create policy "beta_insert_leads_admin"
on public.leads
for insert
to anon
with check (true);

drop policy if exists "beta_update_leads_admin" on public.leads;
create policy "beta_update_leads_admin"
on public.leads
for update
to anon
using (true)
with check (true);

drop policy if exists "beta_read_lead_activity_logs" on public.lead_activity_logs;
create policy "beta_read_lead_activity_logs"
on public.lead_activity_logs
for select
to anon
using (true);

drop policy if exists "beta_write_lead_activity_logs" on public.lead_activity_logs;
create policy "beta_write_lead_activity_logs"
on public.lead_activity_logs
for all
to anon
using (true)
with check (true);

-- Keep existing converted prospects aligned with converted lead status where possible.
update public.leads l
set status = 'converted', updated_at = now()
where exists (
  select 1 from public.prospects p where p.lead_id = l.id
)
and coalesce(l.status,'') <> 'converted';
