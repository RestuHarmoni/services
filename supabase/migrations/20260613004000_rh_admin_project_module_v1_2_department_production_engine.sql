-- RH Admin Project Module V1.2 - Department & Production Engine
-- Adds department production tracking on top of Project Module V1.1.

create table if not exists public.project_departments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  department_key text not null,
  department_name text not null,
  stage text default 'onboarding',
  owner_staff text,
  status text default 'pending',
  progress numeric default 0,
  sort_order integer default 0,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.project_departments add column if not exists department_key text;
alter table public.project_departments add column if not exists department_name text;
alter table public.project_departments add column if not exists stage text default 'onboarding';
alter table public.project_departments add column if not exists owner_staff text;
alter table public.project_departments add column if not exists status text default 'pending';
alter table public.project_departments add column if not exists progress numeric default 0;
alter table public.project_departments add column if not exists sort_order integer default 0;
alter table public.project_departments add column if not exists notes text;
alter table public.project_departments add column if not exists started_at timestamptz;
alter table public.project_departments add column if not exists completed_at timestamptz;
alter table public.project_departments add column if not exists created_by text;
alter table public.project_departments add column if not exists created_at timestamptz default now();
alter table public.project_departments add column if not exists updated_at timestamptz default now();

create unique index if not exists idx_project_departments_unique_key
on public.project_departments(project_id, department_key);
create index if not exists idx_project_departments_project_id on public.project_departments(project_id);
create index if not exists idx_project_departments_status on public.project_departments(status);
create index if not exists idx_project_departments_stage on public.project_departments(stage);

alter table public.project_departments enable row level security;

drop policy if exists "rh_admin_project_departments_select" on public.project_departments;
drop policy if exists "rh_admin_project_departments_insert" on public.project_departments;
drop policy if exists "rh_admin_project_departments_update" on public.project_departments;

create policy "rh_admin_project_departments_select" on public.project_departments for select to anon using (true);
create policy "rh_admin_project_departments_insert" on public.project_departments for insert to anon with check (true);
create policy "rh_admin_project_departments_update" on public.project_departments for update to anon using (true) with check (true);

-- Seed departments for existing projects without changing completed project status.
insert into public.project_departments(project_id, department_key, department_name, stage, owner_staff, status, progress, sort_order, created_by)
select p.id, d.department_key, d.department_name, d.stage,
       case when d.department_key='pm' then coalesce(p.assigned_pm,'SUPER001') else d.owner_staff end,
       case when d.department_key='pm' then 'active' else 'pending' end,
       0, d.sort_order, 'system'
from public.projects p
cross join (values
  ('pm','Project Management','onboarding','SUPER001',1),
  ('content','Content Collection','content_collection','Content Team',2),
  ('design','UI / Design','design','Design Team',3),
  ('development','Development','development','Dev Team',4),
  ('seo','SEO & Technical','review','SEO Team',5),
  ('qa','QA Review','review','QA Team',6),
  ('delivery','Delivery / Handover','delivery','Delivery Team',7)
) as d(department_key, department_name, stage, owner_staff, sort_order)
where not exists (
  select 1 from public.project_departments pd
  where pd.project_id=p.id and pd.department_key=d.department_key
);
