-- RH Admin V1.7 Project Module V1.0
-- Project delivery pipeline generated from paid/partial paid invoice.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_no text unique,
  invoice_id uuid,
  quotation_id uuid,
  prospect_id uuid,
  client_name text,
  phone text,
  email text,
  company text,
  business_type text,
  package_name text,
  project_value numeric default 0,
  amount_paid numeric default 0,
  balance_due numeric default 0,
  status text default 'new_project',
  priority text default 'normal',
  assigned_pm text,
  assigned_team text,
  start_date date,
  due_date date,
  completed_at timestamptz,
  notes text,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.project_timeline (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  action text,
  note text,
  created_by text,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;
alter table public.project_timeline enable row level security;

drop policy if exists "rh_admin_projects_select" on public.projects;
drop policy if exists "rh_admin_projects_insert" on public.projects;
drop policy if exists "rh_admin_projects_update" on public.projects;
drop policy if exists "rh_admin_project_timeline_select" on public.project_timeline;
drop policy if exists "rh_admin_project_timeline_insert" on public.project_timeline;

create policy "rh_admin_projects_select" on public.projects for select to anon using (true);
create policy "rh_admin_projects_insert" on public.projects for insert to anon with check (true);
create policy "rh_admin_projects_update" on public.projects for update to anon using (true) with check (true);

create policy "rh_admin_project_timeline_select" on public.project_timeline for select to anon using (true);
create policy "rh_admin_project_timeline_insert" on public.project_timeline for insert to anon with check (true);

create index if not exists idx_projects_invoice_id on public.projects(invoice_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_created_at on public.projects(created_at desc);
create index if not exists idx_project_timeline_project_id on public.project_timeline(project_id);
