-- RH Admin Project Module V1.1 - Workflow & Task Engine
-- Safe patch: onboarding default, progress 0, task checklist and RLS policies.

alter table public.projects
  alter column status set default 'onboarding';

alter table public.projects
  alter column progress set default 0;

alter table public.projects add column if not exists progress numeric default 0;
alter table public.projects add column if not exists source text default 'invoice';
alter table public.projects add column if not exists assigned_team text;
alter table public.projects add column if not exists project_type text;
alter table public.projects add column if not exists domain text;
alter table public.projects add column if not exists hosting text;
alter table public.projects add column if not exists content_status text default 'pending';
alter table public.projects add column if not exists design_status text default 'pending';
alter table public.projects add column if not exists development_status text default 'pending';
alter table public.projects add column if not exists qa_status text default 'pending';
alter table public.projects add column if not exists delivery_status text default 'pending';

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  task_title text,
  stage text default 'onboarding',
  status text default 'todo',
  assigned_to text,
  sort_order integer default 0,
  completed_at timestamptz,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.project_tasks enable row level security;

drop policy if exists "rh_admin_project_tasks_select" on public.project_tasks;
drop policy if exists "rh_admin_project_tasks_insert" on public.project_tasks;
drop policy if exists "rh_admin_project_tasks_update" on public.project_tasks;

create policy "rh_admin_project_tasks_select" on public.project_tasks for select to anon using (true);
create policy "rh_admin_project_tasks_insert" on public.project_tasks for insert to anon with check (true);
create policy "rh_admin_project_tasks_update" on public.project_tasks for update to anon using (true) with check (true);

create index if not exists idx_project_tasks_project_id on public.project_tasks(project_id);
create index if not exists idx_project_tasks_status on public.project_tasks(status);
create index if not exists idx_project_tasks_stage on public.project_tasks(stage);

-- Keep existing projects safe. Only normalise projects that are still in the old starter state.
update public.projects
set status = 'onboarding', progress = coalesce(nullif(progress,100),0), updated_at = now()
where status = 'new_project';
