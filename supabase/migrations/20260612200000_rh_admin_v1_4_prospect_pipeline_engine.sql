-- RH Admin V1.4 - Prospect Sales Pipeline Engine

alter table public.prospects
add column if not exists sales_stage text default 'data_review';

alter table public.prospects
add column if not exists prospect_status text default 'data_review';

alter table public.prospects
add column if not exists proposal_sent_at timestamptz;

alter table public.prospects
add column if not exists won_at timestamptz;

alter table public.prospects
add column if not exists lost_at timestamptz;

alter table public.prospects
add column if not exists lost_reason text;

alter table public.prospects
add column if not exists updated_at timestamptz default now();

update public.prospects
set sales_stage = case
  when lower(coalesce(sales_stage, prospect_status, '')) in ('new_prospect','contacted','') then 'data_review'
  when lower(coalesce(sales_stage, prospect_status, '')) in ('data_review','proposal_sent','negotiation','won','lost') then lower(coalesce(sales_stage, prospect_status))
  else 'data_review'
end,
prospect_status = case
  when lower(coalesce(sales_stage, prospect_status, '')) in ('new_prospect','contacted','') then 'data_review'
  when lower(coalesce(sales_stage, prospect_status, '')) in ('data_review','proposal_sent','negotiation','won','lost') then lower(coalesce(sales_stage, prospect_status))
  else 'data_review'
end
where sales_stage is null
   or prospect_status is null
   or lower(coalesce(sales_stage, prospect_status, '')) in ('new_prospect','contacted','');

create table if not exists public.prospect_stage_logs (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid,
  old_stage text,
  new_stage text,
  notes text,
  changed_by text,
  created_at timestamptz default now()
);

alter table public.prospect_stage_logs enable row level security;

drop policy if exists "beta_read_prospect_stage_logs" on public.prospect_stage_logs;
create policy "beta_read_prospect_stage_logs"
on public.prospect_stage_logs
for select
to anon
using (true);

drop policy if exists "beta_insert_prospect_stage_logs" on public.prospect_stage_logs;
create policy "beta_insert_prospect_stage_logs"
on public.prospect_stage_logs
for insert
to anon
with check (true);

insert into public.prospect_stage_logs (prospect_id, old_stage, new_stage, notes, changed_by)
select id, null, coalesce(sales_stage, 'data_review'), 'Initial pipeline sync V1.4', 'system'
from public.prospects p
where not exists (
  select 1 from public.prospect_stage_logs l where l.prospect_id = p.id
);
