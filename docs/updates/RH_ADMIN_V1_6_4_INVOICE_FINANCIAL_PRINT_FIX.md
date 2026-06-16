# RH Admin Invoice Module V1.1.3 – Financial & Print Engine Fix

## Fixes

- Corrected invoice `balance_due` during invoice creation.
- Draft invoice with deposit now shows balance after deposit, not full invoice total.
- Payment flow still calculates remaining balance against actual amount paid.
- Compact invoice print CSS for single-page A4 output.
- Payment timeline is hidden from client-facing print/PDF to prevent second blank/footer page.

## Expected

Example RM2,999 invoice with RM1,500 deposit:

- Invoice Total: RM2,999
- Deposit Required: RM1,500
- Paid: RM0
- Balance Due: RM1,499

Print preview target: 1 sheet of paper for standard RH Ecosystem invoice.
