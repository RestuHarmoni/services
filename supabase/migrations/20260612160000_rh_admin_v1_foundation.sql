-- RH ADMIN V1 FOUNDATION
-- Run in Supabase Beta SQL Editor before testing /admin/login.html

create table if not exists public.staff_users (
  id uuid primary key default gen_random_uuid(),
  staff_id text unique not null,
  password_hash text not null,
  full_name text not null,
  role text not null default 'STAFF',
  status text not null default 'active',
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  name text,
  phone text,
  email text,
  company text,
  business_type text,
  domain_status text,
  hosting_status text,
  notes text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_no text unique,
  prospect_id uuid,
  package_name text,
  subtotal numeric default 0,
  discount numeric default 0,
  total_amount numeric default 0,
  status text default 'draft',
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid,
  description text,
  quantity numeric default 1,
  unit_price numeric default 0,
  total numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique,
  quotation_id uuid,
  prospect_id uuid,
  subtotal numeric default 0,
  discount numeric default 0,
  total_amount numeric default 0,
  paid_amount numeric default 0,
  balance_amount numeric default 0,
  status text default 'draft',
  due_date date,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid,
  description text,
  quantity numeric default 1,
  unit_price numeric default 0,
  total numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_no text unique,
  invoice_id uuid,
  amount numeric default 0,
  payment_method text,
  payment_reference text,
  payment_date date default current_date,
  created_by text,
  created_at timestamptz default now()
);

create table if not exists public.aira_knowledge (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'General',
  status text default 'active',
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.client_files (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid,
  file_name text,
  file_url text,
  file_type text,
  bucket text default 'client-files',
  uploaded_by text,
  created_at timestamptz default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id text,
  action text,
  message text,
  staff_id text,
  created_at timestamptz default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb,
  updated_at timestamptz default now()
);

alter table public.staff_users enable row level security;
alter table public.prospects enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.receipts enable row level security;
alter table public.aira_knowledge enable row level security;
alter table public.client_files enable row level security;
alter table public.activity_logs enable row level security;
alter table public.settings enable row level security;

-- Beta policies. Tighten before production.

-- staff_users
drop policy if exists "beta_read_staff_users" on public.staff_users;
create policy "beta_read_staff_users" on public.staff_users for select to anon using (true);
drop policy if exists "beta_update_staff_login" on public.staff_users;
create policy "beta_update_staff_login" on public.staff_users for update to anon using (true) with check (true);

-- prospects
drop policy if exists "beta_read_prospects" on public.prospects;
create policy "beta_read_prospects" on public.prospects for select to anon using (true);
drop policy if exists "beta_write_prospects" on public.prospects;
create policy "beta_write_prospects" on public.prospects for all to anon using (true) with check (true);

-- quotations
drop policy if exists "beta_read_quotations" on public.quotations;
create policy "beta_read_quotations" on public.quotations for select to anon using (true);
drop policy if exists "beta_write_quotations" on public.quotations;
create policy "beta_write_quotations" on public.quotations for all to anon using (true) with check (true);

-- quotation_items
drop policy if exists "beta_read_quotation_items" on public.quotation_items;
create policy "beta_read_quotation_items" on public.quotation_items for select to anon using (true);
drop policy if exists "beta_write_quotation_items" on public.quotation_items;
create policy "beta_write_quotation_items" on public.quotation_items for all to anon using (true) with check (true);

-- invoices
drop policy if exists "beta_read_invoices" on public.invoices;
create policy "beta_read_invoices" on public.invoices for select to anon using (true);
drop policy if exists "beta_write_invoices" on public.invoices;
create policy "beta_write_invoices" on public.invoices for all to anon using (true) with check (true);

-- invoice_items
drop policy if exists "beta_read_invoice_items" on public.invoice_items;
create policy "beta_read_invoice_items" on public.invoice_items for select to anon using (true);
drop policy if exists "beta_write_invoice_items" on public.invoice_items;
create policy "beta_write_invoice_items" on public.invoice_items for all to anon using (true) with check (true);

-- receipts
drop policy if exists "beta_read_receipts" on public.receipts;
create policy "beta_read_receipts" on public.receipts for select to anon using (true);
drop policy if exists "beta_write_receipts" on public.receipts;
create policy "beta_write_receipts" on public.receipts for all to anon using (true) with check (true);

-- aira_knowledge
drop policy if exists "public_read_aira_knowledge" on public.aira_knowledge;
create policy "public_read_aira_knowledge" on public.aira_knowledge for select to anon using (status = 'active');
drop policy if exists "beta_write_aira_knowledge" on public.aira_knowledge;
create policy "beta_write_aira_knowledge" on public.aira_knowledge for all to anon using (true) with check (true);

-- client_files
drop policy if exists "beta_read_client_files" on public.client_files;
create policy "beta_read_client_files" on public.client_files for select to anon using (true);
drop policy if exists "beta_write_client_files" on public.client_files;
create policy "beta_write_client_files" on public.client_files for all to anon using (true) with check (true);

-- activity_logs
drop policy if exists "beta_read_activity_logs" on public.activity_logs;
create policy "beta_read_activity_logs" on public.activity_logs for select to anon using (true);
drop policy if exists "beta_write_activity_logs" on public.activity_logs;
create policy "beta_write_activity_logs" on public.activity_logs for all to anon using (true) with check (true);

-- settings
drop policy if exists "beta_read_settings" on public.settings;
create policy "beta_read_settings" on public.settings for select to anon using (true);
drop policy if exists "beta_write_settings" on public.settings;
create policy "beta_write_settings" on public.settings for all to anon using (true) with check (true);

-- Default staff. Password for all default users: rh123456
-- SHA-256('rh123456') = 0b0f01a7a09e721f768a5a373f1e0deabd0029e49275b913ac8d86d1f91b42c8
insert into public.staff_users (staff_id, password_hash, full_name, role, status)
values
('SUPER001','0b0f01a7a09e721f768a5a373f1e0deabd0029e49275b913ac8d86d1f91b42c8','Super Admin','SUPER_ADMIN','active'),
('ADMIN001','0b0f01a7a09e721f768a5a373f1e0deabd0029e49275b913ac8d86d1f91b42c8','Admin RH','ADMIN','active'),
('STAFF001','0b0f01a7a09e721f768a5a373f1e0deabd0029e49275b913ac8d86d1f91b42c8','Staff RH','STAFF','active')
on conflict (staff_id) do nothing;

insert into public.settings (setting_key, setting_value)
values
('package_pricing', '{"RH Basic":{"setup_price":799,"maintenance":79},"RH Starter":{"setup_price":1299,"maintenance":129},"RH Growth":{"setup_price":1999,"maintenance":179},"RH Ecosystem":{"setup_price":2999,"maintenance":249}}'::jsonb),
('company_profile', '{"name":"Restu Harmoni Digital Solutions","website":"services.restuharmoni.com"}'::jsonb)
on conflict (setting_key) do nothing;
