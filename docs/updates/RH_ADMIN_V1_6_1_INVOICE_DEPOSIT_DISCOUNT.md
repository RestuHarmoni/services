# RH Admin V1.6.1 — Invoice Module V1.1 Deposit / Discount Update

## Added
- Discount field during invoice creation.
- Deposit type: percentage or fixed amount.
- Deposit value and computed deposit amount.
- Net amount and balance after deposit calculation.
- Payment form defaults to deposit amount for first payment.
- Partial paid status supports deposit workflow.
- Project Start Ready timeline note after first deposit payment.

## SQL
Run:

```text
supabase/migrations/20260612224500_rh_admin_v1_6_1_invoice_deposit_discount.sql
```

## QA
1. Open `/admin/invoices.html`.
2. Click `+ New Invoice`.
3. Pick an accepted quotation.
4. Enter discount.
5. Select deposit type and value.
6. Confirm Net Amount, Deposit Required and Balance After Deposit are calculated.
7. Generate invoice.
8. Record deposit payment.
9. Confirm status becomes `Partial Paid`.
10. Record balance payment.
11. Confirm status becomes `Paid`.
