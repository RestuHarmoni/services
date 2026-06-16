-- RH Services v12.0 Sales Workspace Rebuild
-- Safe additive migration. One source of truth: public.leads.
-- Run after deploy. This does not delete existing data.

alter table public.leads add column if not exists sales_stage text default 'new';
alter table public.leads add column if not exists sales_notes text;
alter table public.leads add column if not exists followup_date date;
alter table public.leads add column if not exists assigned_to text;
alter table public.leads add column if not exists quotation_number text;
alter table public.leads add column if not exists quotation_status text default 'none';
alter table public.leads add column if not exists quotation_amount numeric;
alter table public.leads add column if not exists maintenance_amount numeric;
alter table public.leads add column if not exists won_date timestamptz;
alter table public.leads add column if not exists lost_reason text;
alter table public.leads add column if not exists last_activity_at timestamptz default now();

-- Normalize existing legacy status into the new sales_stage without breaking old status display.
update public.leads
set sales_stage = case
  when lower(coalesce(sales_stage,'')) in ('new','prospect','quotation','negotiation','won','lost') then lower(sales_stage)
  when upper(coalesce(status,'')) = 'WON' then 'won'
  when upper(coalesce(status,'')) = 'LOST' then 'lost'
  when upper(coalesce(status,'')) = 'QUOTATION_SENT' then 'quotation'
  when upper(coalesce(status,'')) = 'CONTACTED' then 'prospect'
  else 'new'
end
where sales_stage is null
   or lower(coalesce(sales_stage,'')) not in ('new','prospect','quotation','negotiation','won','lost');

-- Normalize quotation_status.
update public.leads
set quotation_status = coalesce(nullif(quotation_status,''), 'none')
where quotation_status is null or quotation_status = '';

-- Optional helpful indexes.
create index if not exists idx_leads_sales_stage on public.leads(sales_stage);
create index if not exists idx_leads_followup_date on public.leads(followup_date);
create index if not exists idx_leads_quotation_number on public.leads(quotation_number);

-- Guardrails. Added as NOT VALID first so existing unusual data will not block deploy.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_sales_stage_allowed'
  ) then
    alter table public.leads
      add constraint leads_sales_stage_allowed
      check (sales_stage in ('new','prospect','quotation','negotiation','won','lost')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_quotation_status_allowed'
  ) then
    alter table public.leads
      add constraint leads_quotation_status_allowed
      check (quotation_status in ('none','draft','sent','accepted','rejected')) not valid;
  end if;
end $$;
