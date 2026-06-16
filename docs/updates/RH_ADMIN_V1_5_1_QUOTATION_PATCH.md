# RH Admin V1.5.1 — Quotation Module V1.0.1 Patch

## Status
Ready for beta QA.

## Fixes
- Client quotation preview no longer exposes internal/system notes such as `[System] Marked for review...`.
- Added `client_notes` column for client-facing quotation notes.
- Quotation action buttons are locked after final status:
  - Accepted: View only
  - Rejected: View only
- Draft quotations show Sent/Reject only.
- Sent quotations show Accept/Reject only.

## SQL
Run:

```text
supabase/migrations/20260612213000_rh_admin_v1_5_1_quotation_patch.sql
```

## QA
1. Open `/admin/quotations.html`.
2. View accepted quotation.
3. Confirm internal/system notes are not displayed in PDF preview.
4. Confirm accepted/rejected quotation does not show Sent/Accept/Reject action buttons.
