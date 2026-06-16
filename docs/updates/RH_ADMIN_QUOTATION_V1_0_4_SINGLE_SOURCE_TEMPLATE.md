# RH Admin Quotation Module V1.0.4

## Single Source Quotation Template

Tujuan patch ini ialah memastikan quotation preview dan print/PDF menggunakan template yang sama.

### Fix
- Print tidak lagi mengambil layout modal dashboard.
- Sistem clone `.quote-document` yang sama ke `#rhPrintRoot` sebelum print.
- Preview dan PDF menggunakan content source yang sama.
- CSS print compact untuk sasaran 1 muka surat A4 bagi quotation standard RH.
- Totals, signature dan footer kekal bersama dalam PDF.
- Amount kanan tidak terpotong.

### QA
1. Buka `/admin/quotations.html`.
2. Klik `View` quotation.
3. Pastikan preview nampak sebagai dokumen A4 putih.
4. Klik `Print / PDF`.
5. Preview print sepatutnya tidak lagi keluar 3 page untuk quotation standard RH Ecosystem.

