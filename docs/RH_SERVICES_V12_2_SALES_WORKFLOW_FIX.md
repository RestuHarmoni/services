# RH Services v12.2 Sales Workflow Fix

Tujuan patch ini ialah membaiki workflow admin yang masih menyusahkan selepas v12.1.

## Fix utama

1. Lead Inbox tidak lagi guna iframe `admin-leads.html`.
2. Masalah `services.restuharmoni.com refused to connect` diselesaikan.
3. Lead Aira dipaparkan terus dalam `admin.html` melalui Supabase.
4. Butang `Convert To Prospect` ditambah.
5. Prospect tidak perlu diisi semula secara manual.
6. Prospect register menyimpan `leadId`, package, score dan temperature.
7. Full Lead Workspace masih dikekalkan sebagai backup di `admin-leads.html`.

## Fail diubah

- `office-system.js`
- `admin.html`
- `sw.js`
- `version.js`

## SQL

Tiada SQL baru diperlukan jika migration v12.0 telah dijalankan.
