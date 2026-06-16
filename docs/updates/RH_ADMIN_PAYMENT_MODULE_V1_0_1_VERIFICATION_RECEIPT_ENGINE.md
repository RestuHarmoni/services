# RH Admin Payment Module V1.0.1

## Payment Verification & Receipt Engine

- Upload receipt terus ke Supabase Storage bucket `payment-receipts`.
- Payment Type: Deposit, Progress, Final, Full Payment.
- Payment Method: Bank Transfer, DuitNow, FPX, Cash, Cheque.
- Payment History dipaparkan dalam invoice view.
- Bayaran disimpan sebagai verified oleh staff semasa.
- Invoice status automatik: `partial_paid` jika masih berbaki, `paid` jika selesai.
- Deposit pertama akan set `project_start_ready=true`.
- Button Save Payment tidak lagi terus paksa Mark Paid.
