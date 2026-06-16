-- RH Admin V1.6.2 - Invoice Module V1.1.1 Billing Form Enhancement
-- Run after 20260612224500_rh_admin_v1_6_1_invoice_deposit_discount.sql

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value text,
  description text,
  updated_at timestamptz default now()
);

alter table public.system_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='system_settings' and policyname='system_settings_select_anon'
  ) then
    create policy system_settings_select_anon on public.system_settings for select to anon using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='system_settings' and policyname='system_settings_insert_anon'
  ) then
    create policy system_settings_insert_anon on public.system_settings for insert to anon with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='system_settings' and policyname='system_settings_update_anon'
  ) then
    create policy system_settings_update_anon on public.system_settings for update to anon using (true) with check (true);
  end if;
end $$;

insert into public.system_settings (setting_key, setting_value, description)
values (
  'invoice_bank_details',
  'Maybank / Restu Harmoni Digital Solutions / XXXXXXXXXX',
  'Default bank account displayed on RH invoices.'
)
on conflict (setting_key) do nothing;

alter table public.invoices
add column if not exists balance_after_deposit numeric default 0,
add column if not exists project_start_ready boolean default false,
add column if not exists project_started_at timestamptz;

update public.invoices
set balance_after_deposit = greatest(0, coalesce(net_amount, grand_total, total_amount, 0) - coalesce(deposit_amount, 0))
where coalesce(balance_after_deposit,0)=0;
