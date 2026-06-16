# RH Services QA Patch V16.1

## Base File Digunakan
services-main-update-16jun v1.zip

## Module Diubah
Quotation Engine dan Project Detail UI sahaja.

## File Terlibat
- admin/assets/admin.js
- admin/assets/admin.css
- RH-QA-PATCH-V16.1-NOTES.md

## Fix Dibuat
1. Quotation content cleanup
   - Data mentah Aira, FAQ topics, internal notes dan sales qualification tidak lagi dipaparkan dalam client-facing quotation.
   - Quotation kini guna public package description berdasarkan pakej.

2. Quotation view overlap fix
   - Action bar bawah tidak lagi bertindih dengan preview quotation.
   - Preview boleh scroll dengan ruang bawah yang betul.

3. Project detail spacing fix
   - Label dan value dalam project detail tidak lagi melekat.
   - Field seperti Client, Phone, Project Value dan Amount Paid dipaparkan lebih kemas.

## SQL Diperlukan
Tidak diperlukan.

## SQL Tidak Diperlukan
Tiada ALTER TABLE, DROP TABLE atau DELETE DATA.

## Module Tidak Disentuh
- Login System
- Leads
- Prospects
- Invoice Engine
- Payment Engine
- Receipt Engine
- Delete Engine
- Dashboard Engine

## QA Fokus Selepas Upload
1. Buka Quotation Detail dan pastikan tiada Aira Answers/FAQ Topics dalam package box.
2. Scroll Quotation Detail dan pastikan table tidak bertindih dengan action button.
3. Buka Project Detail dan pastikan label/value tidak melekat.
