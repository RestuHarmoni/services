# RH Admin Payment Module V1.0.3 – View Button Supabase Client Fix

## Fix
- Invoice View button now loads invoice detail through the Supabase browser client.
- Payment History loads through the Supabase browser client.
- Receipt button uses Supabase Storage signed URL fallback.
- Manual REST calls without `apikey` are avoided for invoice view flows.
- Error alerts now identify whether invoice, items, payment history, timeline or receipt failed.
- Service worker version bumped to clear stale cached admin JS.

## QA
1. Open `/admin/invoices.html`.
2. Click **View** on a partial paid invoice.
3. Confirm invoice modal opens.
4. Confirm Payment History appears.
5. Click **Receipt**.
6. Confirm receipt opens without `No API key found in request`.
