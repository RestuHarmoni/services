# RH Admin Invoice Module V1.1.4 - Modal Action Bar Fix

## Fix
- Invoice modal action bar no longer overlaps invoice content.
- Action buttons now appear after invoice preview content in normal document flow.
- Invoice preview keeps full readable content on desktop and mobile.
- Print/PDF mode continues to hide action buttons.

## QA
- Open `/admin/invoices.html`.
- View invoice.
- Scroll to total/payment/signature/footer.
- Confirm buttons do not cover Balance Due or totals.
- Print/PDF remains 1 A4 page for standard invoice.
