# RH Services v1.3.2 — Subscription Status + Secure Edit/Delete

## Base File
services-main-update-v1.3.1-subscription-package-price-fix.zip

## Module Diubah
Subscriptions / Renewal Engine sahaja.

## File Diubah
- admin/assets/subscriptions.js
- admin/assets/subscriptions.css
- admin/subscriptions.html

## SQL Diperlukan
- supabase/migrations/20260616150000_rh_admin_v1_3_2_subscription_status_secure_edit_delete.sql

## Fix Utama
1. Subscription baru dari completed project kini bermula sebagai `Pending Invoice`, bukan `Active` atau `Due Soon`.
2. Selepas tekan `Renew Invoice`, status subscription bertukar kepada `Invoiced`.
3. Selepas renewal invoice ditanda paid, subscription bertukar kepada `Active`.
4. `Due Soon` hanya dikira untuk subscription yang benar-benar `Active`.
5. Tambah butang `Edit` dan `Delete` pada subscription.
6. Edit dan Delete memerlukan password admin.
7. Delete menggunakan soft delete sahaja: `is_deleted`, `deleted_at`, `deleted_by`, `delete_reason`.

## Module Locked Tidak Disentuh
- Leads
- Prospects
- Quotations
- Invoices
- Payments
- Projects
- Dashboard
- Delete Engine utama

## Database Safety
Tiada DROP TABLE.
Tiada DELETE DATA.
