# RH Lead Push Notification v1.0

Tujuan: lead baru dan lead yang belum convert kepada prospect akan keluar notification di phone. Reminder dihantar setiap 5 minit selagi status lead belum `converted`, `archived`, `closed`, `lost`, atau `deleted`.

## Fail yang ditambah/diubah
- `manifest.json`
- `sw.js`
- `push-config.js`
- `admin/dashboard.html`
- `admin/leads.html`
- `admin/assets/admin.js`
- `admin/assets/admin.css`
- `supabase/migrations/20260620090000_rh_lead_push_notification_v1.sql`
- `supabase/functions/send-lead-push/index.ts`

## Supabase SQL perlu run
Run file ini dalam Supabase SQL Editor:

`supabase/migrations/20260620090000_rh_lead_push_notification_v1.sql`

Kemudian aktifkan extension/config ini dengan nilai sebenar:

```sql
create extension if not exists pg_net;
alter database postgres set app.settings.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';
alter database postgres set app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

Untuk reminder setiap 5 minit, aktifkan pg_cron di Supabase dan run:

```sql
select cron.schedule(
  'rh-lead-push-reminder-5min',
  '*/5 * * * *',
  'select public.send_unconverted_lead_push_reminders();'
);
```

## VAPID key
Generate VAPID key:

```bash
npx web-push generate-vapid-keys
```

Masukkan public key ke `push-config.js`:

```js
window.RH_PUSH_CONFIG = {
  publicKey: "PUBLIC_KEY_DI_SINI"
};
```

Masukkan env secret untuk Edge Function:

```bash
supabase secrets set VAPID_PUBLIC_KEY="PUBLIC_KEY" VAPID_PRIVATE_KEY="PRIVATE_KEY" VAPID_SUBJECT="mailto:admin@restuharmoni.com"
```

Deploy function:

```bash
supabase functions deploy send-lead-push --no-verify-jwt
```

## Cara test di phone
1. Deploy file ke Cloudflare/GitHub.
2. Buka `https://services.restuharmoni.com/admin/dashboard.html` di phone.
3. Install PWA / Add to Home Screen.
4. Login admin.
5. Tekan `Aktifkan Push` dan pilih Allow.
6. Tekan `Test Notification`.
7. Masukkan lead baru melalui Aira.
8. Kalau lead belum convert kepada prospect, notification akan repeat setiap 5 minit.

Nota: iPhone memerlukan PWA dipasang ke Home Screen untuk Web Push berfungsi dengan stabil.
