# RH Admin Payment Module V1.0.2 — Receipt & Financial Dashboard Fix

## Fixes

- Revenue KPI now uses `sum(invoices.amount_paid)` across all invoices, including `partial_paid`.
- Collection Rate now uses collected amount divided by invoice value, not count of fully paid invoices only.
- Payment Confirmation block now displays the latest verified payment reference and date.
- Receipt uploads validate MIME type: PDF, JPG, PNG, WEBP only.
- Receipt upload stores public URL, storage path and MIME type.
- Receipt button now opens a fresh signed URL when `receipt_path` exists, with public URL fallback.
- Payment History button text shortened to prevent overflow.

## QA

1. Record deposit payment.
2. Confirm invoice status becomes `partial_paid`.
3. Confirm Revenue shows paid amount.
4. Confirm Collection Rate reflects amount collected.
5. Open invoice detail and confirm Payment Confirmation has reference/date.
6. Click Receipt and confirm PDF/image opens.
