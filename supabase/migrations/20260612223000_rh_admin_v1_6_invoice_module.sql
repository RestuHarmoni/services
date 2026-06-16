-- RH Admin V1.6 - Invoice Module V1.0 RH Billing Engine
-- Run in Supabase SQL Editor before QA Invoices.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null,
  quotation_id uuid,
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
  amount_paid numeric default 0,
  balance_due numeric default 0,
  status text default 'draft',
  payment_terms text,
  bank_details text,
  notes text,
  issued_date date default current_date,
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid,
  quotation_item_id uuid,
  description text not null,
  qty numeric default 1,
  unit_price numeric default 0,
  amount numeric default 0,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid,
  payment_date date default current_date,
  amount numeric default 0,
  reference_no text,
  proof_url text,
  notes text,
  created_by text,
  created_at timestamptz default now()
);

create table if not exists public.invoice_timeline (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid,
  action text,
  note text,
  created_by text,
  created_at timestamptz default now()
);

alter table public.invoices
add column if not exists invoice_no text,
add column if not exists quotation_id uuid,
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
add column if not exists amount_paid numeric default 0,
add column if not exists balance_due numeric default 0,
add column if not exists status text default 'draft',
add column if not exists payment_terms text,
add column if not exists bank_details text,
add column if not exists notes text,
add column if not exists issued_date date default current_date,
add column if not exists due_date date,
add column if not exists sent_at timestamptz,
add column if not exists paid_at timestamptz,
add column if not exists cancelled_at timestamptz,
add column if not exists created_by text,
add column if not exists updated_at timestamptz default now();

alter table public.invoice_items
add column if not exists invoice_id uuid,
add column if not exists quotation_item_id uuid,
add column if not exists description text,
add column if not exists qty numeric default 1,
add column if not exists unit_price numeric default 0,
add column if not exists amount numeric default 0,
add column if not exists sort_order integer default 0;

alter table public.invoice_payments
add column if not exists invoice_id uuid,
add column if not exists payment_date date default current_date,
add column if not exists amount numeric default 0,
add column if not exists reference_no text,
add column if not exists proof_url text,
add column if not exists notes text,
add column if not exists created_by text;

alter table public.invoice_timeline
add column if not exists invoice_id uuid,
add column if not exists action text,
add column if not exists note text,
add column if not exists created_by text;

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_payments enable row level security;
alter table public.invoice_timeline enable row level security;

-- Beta admin policies. Tighten before production with authenticated staff-only rules.
drop policy if exists "beta_read_invoices" on public.invoices;
create policy "beta_read_invoices" on public.invoices for select to anon using (true);
drop policy if exists "beta_insert_invoices" on public.invoices;
create policy "beta_insert_invoices" on public.invoices for insert to anon with check (true);
drop policy if exists "beta_update_invoices" on public.invoices;
create policy "beta_update_invoices" on public.invoices for update to anon using (true) with check (true);
drop policy if exists "beta_delete_invoices" on public.invoices;
create policy "beta_delete_invoices" on public.invoices for delete to anon using (true);

drop policy if exists "beta_read_invoice_items" on public.invoice_items;
create policy "beta_read_invoice_items" on public.invoice_items for select to anon using (true);
drop policy if exists "beta_insert_invoice_items" on public.invoice_items;
create policy "beta_insert_invoice_items" on public.invoice_items for insert to anon with check (true);
drop policy if exists "beta_update_invoice_items" on public.invoice_items;
create policy "beta_update_invoice_items" on public.invoice_items for update to anon using (true) with check (true);

drop policy if exists "beta_read_invoice_payments" on public.invoice_payments;
create policy "beta_read_invoice_payments" on public.invoice_payments for select to anon using (true);
drop policy if exists "beta_insert_invoice_payments" on public.invoice_payments;
create policy "beta_insert_invoice_payments" on public.invoice_payments for insert to anon with check (true);
drop policy if exists "beta_update_invoice_payments" on public.invoice_payments;
create policy "beta_update_invoice_payments" on public.invoice_payments for update to anon using (true) with check (true);

drop policy if exists "beta_read_invoice_timeline" on public.invoice_timeline;
create policy "beta_read_invoice_timeline" on public.invoice_timeline for select to anon using (true);
drop policy if exists "beta_insert_invoice_timeline" on public.invoice_timeline;
create policy "beta_insert_invoice_timeline" on public.invoice_timeline for insert to anon with check (true);

create index if not exists invoices_quotation_id_idx on public.invoices(quotation_id);
create index if not exists invoices_prospect_id_idx on public.invoices(prospect_id);
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);
create index if not exists invoice_payments_invoice_id_idx on public.invoice_payments(invoice_id);
create index if not exists invoice_timeline_invoice_id_idx on public.invoice_timeline(invoice_id);
