-- RH Admin Payment Module V1.0.1 - Payment Verification & Receipt Engine

alter table public.invoice_payments
add column if not exists payment_no text,
add column if not exists payment_type text default 'payment',
add column if not exists payment_method text default 'bank_transfer',
add column if not exists status text default 'verified',
add column if not exists verified_by text,
add column if not exists verified_at timestamptz,
add column if not exists rejected_by text,
add column if not exists rejected_at timestamptz,
add column if not exists rejection_reason text;

alter table public.invoices
add column if not exists project_start_ready boolean default false;

insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', true)
on conflict (id) do update set public = true;

drop policy if exists "beta_read_payment_receipts" on storage.objects;
create policy "beta_read_payment_receipts" on storage.objects
for select to anon using (bucket_id = 'payment-receipts');

drop policy if exists "beta_insert_payment_receipts" on storage.objects;
create policy "beta_insert_payment_receipts" on storage.objects
for insert to anon with check (bucket_id = 'payment-receipts');

drop policy if exists "beta_update_payment_receipts" on storage.objects;
create policy "beta_update_payment_receipts" on storage.objects
for update to anon using (bucket_id = 'payment-receipts') with check (bucket_id = 'payment-receipts');

drop policy if exists "beta_read_invoice_payments" on public.invoice_payments;
create policy "beta_read_invoice_payments" on public.invoice_payments for select to anon using (true);
drop policy if exists "beta_insert_invoice_payments" on public.invoice_payments;
create policy "beta_insert_invoice_payments" on public.invoice_payments for insert to anon with check (true);
drop policy if exists "beta_update_invoice_payments" on public.invoice_payments;
create policy "beta_update_invoice_payments" on public.invoice_payments for update to anon using (true) with check (true);

create index if not exists invoice_payments_status_idx on public.invoice_payments(status);
create index if not exists invoice_payments_type_idx on public.invoice_payments(payment_type);
