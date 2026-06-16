# RH Admin V1.3 — Subscription & Renewal Engine

Base file: `services-main-update v1.2.zip`

## Module Baru
- Subscriptions
- Renewal Invoices
- Renewal Reminders
- Freeze / Unfreeze
- Billing cycle: Monthly, 6 Months, Yearly
- Discount amount supported

## File Ditambah
- `admin/subscriptions.html`
- `admin/assets/subscriptions.js`
- `admin/assets/subscriptions.css`
- `supabase/migrations/20260616130000_rh_admin_v1_3_subscription_renewal_engine.sql`

## File Diubah
- Admin HTML navigation sahaja untuk tambah menu `Subscriptions`.

## Module Locked Tidak Diubah
- Leads
- Prospects
- Quotations
- Invoices
- Payments
- Projects
- Dashboard engine logic

## SQL Diperlukan
Ya. Run migration:
`20260616130000_rh_admin_v1_3_subscription_renewal_engine.sql`

## SQL Tidak Digunakan
- No DROP TABLE
- No DELETE DATA
- No TRUNCATE

## QA Target
Project Completed → Subscription → Renewal Invoice → Renewal Payment → Active Period Extension.
