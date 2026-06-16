-- RH SERVICES v1.5.4 STAFF MANAGEMENT MODULE
-- Safe migration: no DROP TABLE, no DELETE DATA.

alter table public.staff_users
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists department text,
  add column if not exists notes text,
  add column if not exists created_by text,
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by text,
  add column if not exists delete_reason text;

update public.staff_users
set is_deleted = false
where is_deleted is null;

create index if not exists idx_staff_users_staff_id on public.staff_users(staff_id);
create index if not exists idx_staff_users_status on public.staff_users(status);
create index if not exists idx_staff_users_role on public.staff_users(role);

-- Admin frontend currently uses anon REST with Staff ID session verification.
-- These policies keep existing login working and allow staff management from RH Admin.
drop policy if exists "beta_insert_staff_users" on public.staff_users;
create policy "beta_insert_staff_users" on public.staff_users for insert to anon with check (true);

drop policy if exists "beta_delete_staff_users" on public.staff_users;
create policy "beta_delete_staff_users" on public.staff_users for delete to anon using (false);

-- Ensure update policy exists for soft delete, status change, reset password and last_login.
drop policy if exists "beta_update_staff_login" on public.staff_users;
create policy "beta_update_staff_login" on public.staff_users for update to anon using (true) with check (true);
