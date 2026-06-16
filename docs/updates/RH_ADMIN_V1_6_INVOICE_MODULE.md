# RH Admin V1.6 - Invoice Module V1.0 RH Billing Engine

## Added
- Admin `/admin/invoices.html` billing dashboard.
- Generate invoice from accepted quotation.
- Auto invoice number `INV-YYYY-0001`.
- Invoice status: Draft, Sent, Partial Paid, Paid, Overdue, Cancelled.
- Invoice PDF/print preview using RH single source document template.
- Payment record modal with amount, reference, proof URL and notes.
- Invoice timeline foundation.
- Tables: `invoices`, `invoice_items`, `invoice_payments`, `invoice_timeline`.

## QA
1. Run SQL migration `20260612223000_rh_admin_v1_6_invoice_module.sql`.
2. Open `/admin/invoices.html`.
3. Click `+ New Invoice`.
4. Select an Accepted quotation.
5. Generate invoice and check PDF.
6. Mark Sent.
7. Mark Paid and confirm dashboard Revenue updates.
