# RH Services v12.4.3 — Negotiation Financial Engine

## Scope

Patch ini melengkapkan workspace Negotiation supaya boleh digunakan sebagai ruang closing sebenar.

## Perubahan

1. Version bump kepada `v12.4.3-negotiation-financial-engine`.
2. Tambah financial negotiation fields:
   - Original Price
   - Discount Amount
   - Final Price
3. Final Price auto kira: `Original Price - Discount Amount`.
4. Negotiation Register kini papar Original, Final, Discount dan Lost Reason.
5. KPI Negotiation dikemaskini:
   - Active Value
   - Need Revision
   - Won
   - Lost
   - Total Negotiation
6. Lost Reason Engine untuk status Lost:
   - Harga
   - Vendor lain
   - Tiada bajet
   - Tangguh
   - No response
   - Lain-lain
7. Status Won memaparkan butang `Create Won Deal`.
8. `Create Won Deal` mencipta rekod awal dalam Won Deal Register menggunakan nilai Final Price.
9. Follow-up timeline merekod perubahan status dan perubahan harga rundingan.

## QA

1. Buka Negotiation.
2. Pilih negotiation.
3. Masukkan Discount Amount.
4. Pastikan Final Price auto berubah.
5. Save Status.
6. Semak register memaparkan Original / Final / Discount.
7. Tukar status Lost dan pilih Lost Reason.
8. Tukar status Won dan klik Create Won Deal.
9. Semak Won Deals menerima rekod.
