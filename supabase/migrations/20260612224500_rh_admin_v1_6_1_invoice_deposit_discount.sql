-- RH Admin V1.6.1 - Invoice Module V1.1 Deposit / Discount / Balance Update
-- Run after 20260612223000_rh_admin_v1_6_invoice_module.sql

alter table public.invoices
add column if not exists original_amount numeric default 0,
add column if not exists net_amount numeric default 0,
add column if not exists deposit_type text default 'percent',
add column if not exists deposit_value numeric default 50,
add column if not exists deposit_amount numeric default 0,
add column if not exists balance_after_deposit numeric default 0,
add column if not exists project_start_ready boolean default false,
add column if not exists project_started_at timestamptz;

-- Backfill existing invoices safely.
update public.invoices
set
  original_amount = coalesce(nullif(original_amount,0), nullif(subtotal,0), nullif(total_amount,0), grand_total, 0),
  net_amount = coalesce(nullif(net_amount,0), nullif(grand_total,0), nullif(total_amount,0), 0),
  deposit_type = coalesce(deposit_type, 'percent'),
  deposit_value = coalesce(deposit_value, 50),
  deposit_amount = case
    when coalesce(deposit_amount,0) > 0 then deposit_amount
    else round(coalesce(nullif(grand_total,0), nullif(total_amount,0), 0) * 0.5, 2)
  end,
  balance_after_deposit = case
    when coalesce(balance_after_deposit,0) > 0 then balance_after_deposit
    else greatest(0, coalesce(nullif(grand_total,0), nullif(total_amount,0), 0) - round(coalesce(nullif(grand_total,0), nullif(total_amount,0), 0) * 0.5, 2))
  end
where true;

create index if not exists invoices_status_idx on public.invoices(status);
create index if not exists invoices_due_date_idx on public.invoices(due_date);
