-- RH Admin Project Module V1.0 Full Build
-- Delivery pipeline + project tasks + duplicate protection.

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
  progress numeric default 5,
  priority text default 'normal',
  assigned_pm text,
  assigned_team text,
  source text default 'invoice',
  project_type text,
  domain text,
  hosting text,
  content_status text default 'pending',
  design_status text default 'pending',
  development_status text default 'pending',
  qa_status text default 'pending',
  delivery_status text default 'pending',
  start_date date,
  due_date date,
  completed_at timestamptz,
  notes text,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects add column if not exists progress numeric default 5;
alter table public.projects add column if not exists source text default 'invoice';
alter table public.projects add column if not exists project_type text;
alter table public.projects add column if not exists domain text;
alter table public.projects add column if not exists hosting text;
alter table public.projects add column if not exists content_status text default 'pending';
alter table public.projects add column if not exists design_status text default 'pending';
alter table public.projects add column if not exists development_status text default 'pending';
alter table public.projects add column if not exists qa_status text default 'pending';
alter table public.projects add column if not exists delivery_status text default 'pending';

create table if not exists public.project_timeline (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  action text,
  note text,
  created_by text,
  created_at timestamptz default now()
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  task_title text,
  stage text default 'new_project',
  status text default 'todo',
  assigned_to text,
  sort_order integer default 0,
  completed_at timestamptz,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;
alter table public.project_timeline enable row level security;
alter table public.project_tasks enable row level security;

drop policy if exists "rh_admin_projects_select" on public.projects;
drop policy if exists "rh_admin_projects_insert" on public.projects;
drop policy if exists "rh_admin_projects_update" on public.projects;
drop policy if exists "rh_admin_project_timeline_select" on public.project_timeline;
drop policy if exists "rh_admin_project_timeline_insert" on public.project_timeline;
drop policy if exists "rh_admin_project_tasks_select" on public.project_tasks;
drop policy if exists "rh_admin_project_tasks_insert" on public.project_tasks;
drop policy if exists "rh_admin_project_tasks_update" on public.project_tasks;

create policy "rh_admin_projects_select" on public.projects for select to anon using (true);
create policy "rh_admin_projects_insert" on public.projects for insert to anon with check (true);
create policy "rh_admin_projects_update" on public.projects for update to anon using (true) with check (true);

create policy "rh_admin_project_timeline_select" on public.project_timeline for select to anon using (true);
create policy "rh_admin_project_timeline_insert" on public.project_timeline for insert to anon with check (true);

create policy "rh_admin_project_tasks_select" on public.project_tasks for select to anon using (true);
create policy "rh_admin_project_tasks_insert" on public.project_tasks for insert to anon with check (true);
create policy "rh_admin_project_tasks_update" on public.project_tasks for update to anon using (true) with check (true);

create index if not exists idx_projects_invoice_id on public.projects(invoice_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_created_at on public.projects(created_at desc);
create index if not exists idx_project_timeline_project_id on public.project_timeline(project_id);
create index if not exists idx_project_tasks_project_id on public.project_tasks(project_id);
create index if not exists idx_project_tasks_status on public.project_tasks(status);

-- Prevent duplicate projects from the same invoice.
create unique index if not exists idx_projects_invoice_unique
on public.projects(invoice_id)
where invoice_id is not null;
