# RH Admin V1.6.2 - Invoice Billing Form Enhancement

## Status
Patch update untuk Invoice Module V1.1.

## Perubahan
- Label deposit kini jelas: `Deposit Percentage (%)` atau `Deposit Fixed Amount (RM)`.
- Net Amount ditandakan sebagai auto calculation/read-only.
- Deposit Required diberi highlight hijau.
- Balance After Deposit diberi highlight kuning/oren.
- Due Date auto +14 hari daripada Issue Date.
- Payment Terms ditambah:
  - 50% Deposit, 50% Before Handover
  - 70% Deposit, 30% Before Handover
  - 100% Advance Payment
  - Monthly Subscription
  - Payment Within 7 Days
  - Payment Within 14 Days
  - Custom
- Bank account dibaca daripada `system_settings.invoice_bank_details` jika wujud.
- `balance_after_deposit` disimpan semasa create invoice.

## SQL
Run:

```text
supabase/migrations/20260612225500_rh_admin_v1_6_2_invoice_billing_form_enhancement.sql
```

## QA
1. Buka `/admin/invoices.html`.
2. Klik `+ New Invoice`.
3. Pastikan Due Date auto +14 hari.
4. Pilih Deposit Type `Percentage (%)`, label menjadi `Deposit Percentage (%)`.
5. Pilih Deposit Type `Fixed Amount (RM)`, label berubah menjadi `Deposit Fixed Amount (RM)`.
6. Ubah Discount dan Deposit, pastikan Net Amount, Deposit Required dan Balance auto kira.
