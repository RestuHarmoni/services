-- RH Admin V1.6.3 - Invoice Module V1.1.2 Supabase Header Fix Support
-- Run after 20260612225500_rh_admin_v1_6_2_invoice_billing_form_enhancement.sql

alter table public.invoices
add column if not exists quotation_no text,
add column if not exists bank_account text,
add column if not exists deposit_required numeric default 0,
add column if not exists invoice_notes text;

-- Keep alias fields in sync enough for older/newer UI builds.
update public.invoices
set
  quotation_no = coalesce(quotation_no, null),
  bank_account = coalesce(bank_account, bank_details),
  deposit_required = case
    when coalesce(deposit_required,0) > 0 then deposit_required
    else coalesce(deposit_amount,0)
  end,
  invoice_notes = coalesce(invoice_notes, notes)
where true;

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_payments enable row level security;
alter table public.invoice_timeline enable row level security;

-- Idempotent beta policies for admin QA.
drop policy if exists "beta_read_invoices" on public.invoices;
create policy "beta_read_invoices" on public.invoices for select to anon using (true);
drop policy if exists "beta_insert_invoices" on public.invoices;
create policy "beta_insert_invoices" on public.invoices for insert to anon with check (true);
drop policy if exists "beta_update_invoices" on public.invoices;
create policy "beta_update_invoices" on public.invoices for update to anon using (true) with check (true);

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

create index if not exists invoices_quotation_no_idx on public.invoices(quotation_no);
