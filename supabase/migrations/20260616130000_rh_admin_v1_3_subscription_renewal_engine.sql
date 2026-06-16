-- RH Admin V1.3 Subscription & Renewal Engine
-- Safe migration only. No DROP TABLE, no DELETE DATA.
-- Adds recurring maintenance subscriptions, renewal invoices, reminders, and freeze/unfreeze status.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscription_no text unique,
  project_id uuid,
  project_no text,
  invoice_id uuid,
  client_name text,
  phone text,
  email text,
  company text,
  business_type text,
  package_name text,
  plan_name text,
  billing_cycle text default 'monthly',
  monthly_amount numeric default 0,
  cycle_amount numeric default 0,
  discount_amount numeric default 0,
  status text default 'active',
  start_date date,
  current_period_start date,
  current_period_end date,
  next_billing_date date,
  suspended_at timestamptz,
  cancelled_at timestamptz,
  notes text,
  created_by text,
  is_deleted boolean default false,
  deleted_at timestamptz,
  deleted_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.subscription_invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid,
  invoice_no text unique,
  client_name text,
  phone text,
  email text,
  company text,
  plan_name text,
  billing_cycle text default 'monthly',
  period_start date,
  period_end date,
  amount numeric default 0,
  status text default 'sent',
  due_date date,
  paid_at timestamptz,
  payment_method text,
  payment_reference text,
  notes text,
  created_by text,
  is_deleted boolean default false,
  deleted_at timestamptz,
  deleted_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.renewal_reminders (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid,
  subscription_invoice_id uuid,
  reminder_type text,
  reminder_date date,
  status text default 'pending',
  sent_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
alter table public.subscription_invoices enable row level security;
alter table public.renewal_reminders enable row level security;

-- Safe policy refresh for this new module only.
drop policy if exists "rh_admin_subscriptions_select" on public.subscriptions;
drop policy if exists "rh_admin_subscriptions_insert" on public.subscriptions;
drop policy if exists "rh_admin_subscriptions_update" on public.subscriptions;
drop policy if exists "rh_admin_subscription_invoices_select" on public.subscription_invoices;
drop policy if exists "rh_admin_subscription_invoices_insert" on public.subscription_invoices;
drop policy if exists "rh_admin_subscription_invoices_update" on public.subscription_invoices;
drop policy if exists "rh_admin_renewal_reminders_select" on public.renewal_reminders;
drop policy if exists "rh_admin_renewal_reminders_insert" on public.renewal_reminders;
drop policy if exists "rh_admin_renewal_reminders_update" on public.renewal_reminders;

create policy "rh_admin_subscriptions_select" on public.subscriptions for select to anon using (true);
create policy "rh_admin_subscriptions_insert" on public.subscriptions for insert to anon with check (true);
create policy "rh_admin_subscriptions_update" on public.subscriptions for update to anon using (true) with check (true);

create policy "rh_admin_subscription_invoices_select" on public.subscription_invoices for select to anon using (true);
create policy "rh_admin_subscription_invoices_insert" on public.subscription_invoices for insert to anon with check (true);
create policy "rh_admin_subscription_invoices_update" on public.subscription_invoices for update to anon using (true) with check (true);

create policy "rh_admin_renewal_reminders_select" on public.renewal_reminders for select to anon using (true);
create policy "rh_admin_renewal_reminders_insert" on public.renewal_reminders for insert to anon with check (true);
create policy "rh_admin_renewal_reminders_update" on public.renewal_reminders for update to anon using (true) with check (true);

create index if not exists idx_subscriptions_project_id on public.subscriptions(project_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_next_billing_date on public.subscriptions(next_billing_date);
create index if not exists idx_subscriptions_created_at on public.subscriptions(created_at desc);
create index if not exists idx_subscription_invoices_subscription_id on public.subscription_invoices(subscription_id);
create index if not exists idx_subscription_invoices_status on public.subscription_invoices(status);
create index if not exists idx_subscription_invoices_due_date on public.subscription_invoices(due_date);
create index if not exists idx_renewal_reminders_subscription_id on public.renewal_reminders(subscription_id);
create index if not exists idx_renewal_reminders_invoice_id on public.renewal_reminders(subscription_invoice_id);
create index if not exists idx_renewal_reminders_date on public.renewal_reminders(reminder_date);
