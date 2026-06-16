-- RH Admin Payment Module V1.0.2 - Receipt & Financial Dashboard Fix

alter table public.invoice_payments
add column if not exists receipt_path text,
add column if not exists receipt_mime_type text;

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

create index if not exists invoice_payments_receipt_path_idx on public.invoice_payments(receipt_path);
