-- RH Admin Secure Delete Engine V1.0
-- Soft delete + audit trail for Prospects, Quotations, Invoices, Projects.

alter table if exists public.prospects
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by text;

alter table if exists public.quotations
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by text;

alter table if exists public.invoices
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by text;

alter table if exists public.projects
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by text;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  module text,
  record_id text,
  record_label text,
  action text,
  staff_id text,
  notes text,
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "beta_read_audit_logs" on public.audit_logs;
create policy "beta_read_audit_logs" on public.audit_logs for select to anon using (true);

drop policy if exists "beta_insert_audit_logs" on public.audit_logs;
create policy "beta_insert_audit_logs" on public.audit_logs for insert to anon with check (true);

-- Update policies for soft-delete columns. Existing beta policies may already allow this.
