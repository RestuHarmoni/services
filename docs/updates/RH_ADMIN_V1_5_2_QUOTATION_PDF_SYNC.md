# RH Admin V1.5.2 — Quotation Module V1.0.2

## Status
Ready for QA.

## Changes
- Auto Valid Until fallback: quotation date + 14 days.
- New `valid_until` field support.
- Accepted / Rejected watermark in quotation preview and print PDF.
- Signature block added:
  - Prepared By
  - Client Approval
- Professional footer added.
- Status lock improved for accepted/rejected quotations.
- Audit dates supported:
  - `sent_at`
  - `accepted_at`
  - `rejected_at`
- Print CSS improved for Chrome Save as PDF.

## Migration
Run:

```text
supabase/migrations/20260612220000_rh_admin_v1_5_2_quotation_pdf_sync.sql
```

## QA
1. Open `/admin/quotations.html`.
2. View accepted quotation.
3. Confirm Valid Until is shown.
4. Confirm ACCEPTED watermark appears.
5. Click Print / PDF and Save as PDF.
6. Confirm signature block and footer appear.
7. Confirm accepted/rejected quotation is locked.
