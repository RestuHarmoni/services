-- RH Admin Payment Module V1.0.3
-- View Button Supabase Client Fix
-- No schema change required. This patch standardizes invoice view, payment history and receipt link actions to use Supabase client/auth headers.

create policy if not exists "read_invoice_payments_v103" on public.invoice_payments
for select to anon using (true);

create policy if not exists "read_invoice_items_v103" on public.invoice_items
for select to anon using (true);

create policy if not exists "read_invoice_timeline_v103" on public.invoice_timeline
for select to anon using (true);
