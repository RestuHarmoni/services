-- RH Admin V1.5 - Quotation Module V1.0
-- Run in Supabase SQL Editor before QA Quotations.

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_no text unique not null,
  prospect_id uuid,
  client_name text not null,
  phone text,
  email text,
  company text,
  business_type text,
  package_name text,
  subtotal numeric default 0,
  discount numeric default 0,
  tax numeric default 0,
  grand_total numeric default 0,
  total_amount numeric default 0,
  status text default 'draft',
  notes text,
  expiry_date date,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid,
  description text not null,
  qty numeric default 1,
  unit_price numeric default 0,
  amount numeric default 0,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.quotations
add column if not exists quotation_no text,
add column if not exists prospect_id uuid,
add column if not exists client_name text,
add column if not exists phone text,
add column if not exists email text,
add column if not exists company text,
add column if not exists business_type text,
add column if not exists package_name text,
add column if not exists subtotal numeric default 0,
add column if not exists discount numeric default 0,
add column if not exists tax numeric default 0,
add column if not exists grand_total numeric default 0,
add column if not exists total_amount numeric default 0,
add column if not exists status text default 'draft',
add column if not exists notes text,
add column if not exists expiry_date date,
add column if not exists sent_at timestamptz,
add column if not exists accepted_at timestamptz,
add column if not exists rejected_at timestamptz,
add column if not exists created_by text,
add column if not exists updated_at timestamptz default now();

alter table public.quotation_items
add column if not exists quotation_id uuid,
add column if not exists description text,
add column if not exists qty numeric default 1,
add column if not exists unit_price numeric default 0,
add column if not exists amount numeric default 0,
add column if not exists sort_order integer default 0;

alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

drop policy if exists "beta_read_quotations" on public.quotations;
create policy "beta_read_quotations" on public.quotations for select to anon using (true);

drop policy if exists "beta_insert_quotations" on public.quotations;
create policy "beta_insert_quotations" on public.quotations for insert to anon with check (true);

drop policy if exists "beta_update_quotations" on public.quotations;
create policy "beta_update_quotations" on public.quotations for update to anon using (true) with check (true);

drop policy if exists "beta_delete_quotations" on public.quotations;
create policy "beta_delete_quotations" on public.quotations for delete to anon using (true);

drop policy if exists "beta_read_quotation_items" on public.quotation_items;
create policy "beta_read_quotation_items" on public.quotation_items for select to anon using (true);

drop policy if exists "beta_insert_quotation_items" on public.quotation_items;
create policy "beta_insert_quotation_items" on public.quotation_items for insert to anon with check (true);

drop policy if exists "beta_update_quotation_items" on public.quotation_items;
create policy "beta_update_quotation_items" on public.quotation_items for update to anon using (true) with check (true);

create index if not exists quotations_prospect_id_idx on public.quotations(prospect_id);
create index if not exists quotation_items_quotation_id_idx on public.quotation_items(quotation_id);
