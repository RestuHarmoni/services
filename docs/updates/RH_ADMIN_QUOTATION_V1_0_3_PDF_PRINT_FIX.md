# RH Admin - Quotation Module V1.0.3 PDF Print Fix

Status: Patch

## Fix

- PDF print now allows full quotation content to continue beyond the first page.
- Modal scroll container is disabled during print.
- Totals, signature block and footer are preserved in PDF output.
- A4 portrait print CSS added.
- Table widths adjusted to prevent amount clipping.
- Totals block prevents RM amount overflow.
- Watermark remains fixed and non-blocking.

## QA

Test:

1. Open `/admin/quotations.html`.
2. Click `View` for quotation.
3. Click `Print / PDF`.
4. Save as PDF.
5. Confirm PDF includes:
   - Quotation header
   - Client and package blocks
   - Item table
   - Subtotal / Discount / Tax / Grand Total
   - Prepared By / Client Approval signature block
   - Footer
