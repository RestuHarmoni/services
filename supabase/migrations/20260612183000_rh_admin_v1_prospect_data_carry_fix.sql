-- RH Admin V1.1 - Prospect Data Carry Forward Fix
-- Purpose:
-- 1. Ensure prospect columns exist.
-- 2. Backfill existing prospects from leads.
-- 3. Keep beta RLS open for admin testing.

alter table public.prospects add column if not exists lead_id uuid;
alter table public.prospects add column if not exists objective text;
alter table public.prospects add column if not exists budget text;
alter table public.prospects add column if not exists timeline text;
alter table public.prospects add column if not exists recommended_package text;
alter table public.prospects add column if not exists lead_score integer;
alter table public.prospects add column if not exists lead_temperature text;
alter table public.prospects add column if not exists domain_status text;
alter table public.prospects add column if not exists hosting_status text;
alter table public.prospects add column if not exists notes text;
alter table public.prospects add column if not exists prospect_status text default 'new_prospect';
alter table public.prospects add column if not exists sales_stage text default 'new_prospect';
alter table public.prospects add column if not exists assigned_staff text;
alter table public.prospects add column if not exists updated_at timestamptz default now();

-- Backfill direct lead fields for prospects already converted before V1.1.
update public.prospects p
set
  name = coalesce(nullif(p.name,''), l.name),
  phone = coalesce(nullif(p.phone,''), l.phone),
  business_type = coalesce(nullif(p.business_type,''), l.business_type),
  objective = coalesce(nullif(p.objective,''), l.objective),
  budget = coalesce(nullif(p.budget,''), l.budget),
  timeline = coalesce(nullif(p.timeline,''), l.timeline),
  recommended_package = coalesce(nullif(p.recommended_package,''), l.recommended_package),
  lead_score = coalesce(p.lead_score, l.lead_score),
  lead_temperature = coalesce(nullif(p.lead_temperature,''), l.lead_temperature),
  notes = coalesce(
    nullif(p.notes,''),
    concat_ws(E'\n', l.notes, l.objective, l.budget, l.timeline, l.recommended_package)
  ),
  updated_at = now()
from public.leads l
where p.lead_id = l.id;

-- Backfill domain/website related status from Aira answer text where available.
update public.prospects p
set domain_status = coalesce(nullif(p.domain_status,''), x.answer),
    updated_at = now()
from (
  select distinct on (lead_id) lead_id, answer
  from public.lead_answers
  where lower(coalesce(question_key,'') || ' ' || coalesce(question,'')) like '%domain%'
  order by lead_id, coalesce(sort_order,999), created_at
) x
where p.lead_id = x.lead_id;

update public.prospects p
set hosting_status = coalesce(nullif(p.hosting_status,''), x.answer),
    updated_at = now()
from (
  select distinct on (lead_id) lead_id, answer
  from public.lead_answers
  where lower(coalesce(question_key,'') || ' ' || coalesce(question,'')) like '%website%'
  order by lead_id, coalesce(sort_order,999), created_at
) x
where p.lead_id = x.lead_id;

-- Optional cleanup: mark corrupted test prospects for review instead of deleting.
update public.prospects
set sales_stage = 'data_review',
    prospect_status = 'data_review',
    notes = coalesce(notes,'') || E'\n[System] Marked for review: invalid test name.',
    updated_at = now()
where name ~ '[\[\]{}<>]' or length(trim(coalesce(name,''))) < 2;

create index if not exists idx_prospects_stage_v11 on public.prospects(sales_stage);
create index if not exists idx_prospects_lead_v11 on public.prospects(lead_id);
