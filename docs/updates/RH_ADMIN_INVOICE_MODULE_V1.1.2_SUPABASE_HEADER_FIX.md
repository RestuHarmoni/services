# RH Admin Invoice Module V1.1.2 — Supabase Header Fix

## Issue
Invoice generation failed with Supabase response:

```json
{"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
```

## Fix
- Invoice insert now uses a hardened REST insert helper with required Supabase headers.
- Headers included:
  - `apikey`
  - `Authorization: Bearer <anon key>`
  - `Content-Type: application/json`
  - `Prefer: return=representation`
- Invoice item insert also uses the same header-safe helper.
- Error handling now shows the real Supabase error message instead of a generic alert.

## SQL
Run:

```text
supabase/migrations/20260612230500_rh_admin_v1_6_3_invoice_supabase_header_fix.sql
```

## QA
1. Open `/admin/invoices.html`.
2. Click `+ New Invoice`.
3. Select accepted quotation.
4. Set discount/deposit.
5. Generate invoice.
6. Confirm a new invoice appears in the invoice list.
7. Check Console/Network: no `No API key found in request` error.
