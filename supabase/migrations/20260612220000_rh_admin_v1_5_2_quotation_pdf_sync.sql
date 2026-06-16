-- RH Admin V1.5.2 / Quotation Module V1.0.2
-- Valid Until, audit dates, and quotation/prospect sync support.

alter table if exists public.quotations
  add column if not exists valid_until date,
  add column if not exists sent_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists rejected_at timestamptz;

-- Backfill valid_until safely.
update public.quotations
set valid_until = coalesce(valid_until, (created_at::date + 14))
where valid_until is null;

-- Keep existing expiry_date aligned when the column exists.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotations'
      and column_name = 'expiry_date'
  ) then
    execute 'update public.quotations set expiry_date = coalesce(expiry_date, valid_until) where expiry_date is null';
  end if;
end $$;

-- Helpful indexes.
create index if not exists idx_quotations_status on public.quotations(status);
create index if not exists idx_quotations_valid_until on public.quotations(valid_until);
create index if not exists idx_quotations_prospect_id on public.quotations(prospect_id);

-- Optional RLS policies for beta/client-side admin.
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

drop policy if exists "beta_quotations_all" on public.quotations;
create policy "beta_quotations_all"
on public.quotations
for all
to anon
using (true)
with check (true);

drop policy if exists "beta_quotation_items_all" on public.quotation_items;
create policy "beta_quotation_items_all"
on public.quotation_items
for all
to anon
using (true)
with check (true);
