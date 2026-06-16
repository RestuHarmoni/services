-- RH Admin Secure Delete Engine V1.1
-- No schema change required if V1.0 columns already exist.
-- This migration is intentionally safe/idempotent.

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
