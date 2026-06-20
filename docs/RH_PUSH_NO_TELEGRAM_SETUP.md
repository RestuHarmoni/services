# RH Lead Phone Push v1 — Tanpa Telegram

Tujuan: lead baru dan reminder setiap 5 minit masuk ke phone walaupun dashboard ditutup, selagi lead belum ditukar ke Prospect / Converted.

## 1. Run SQL Supabase
Run fail ini di Supabase SQL Editor:

`supabase/migrations/20260620103000_rh_push_no_telegram_v1.sql`

SQL ini cipta:
- `push_subscriptions`
- `lead_push_logs`
- RLS basic untuk admin

## 2. Generate VAPID keys
Di komputer/dev terminal:

```bash
npx web-push generate-vapid-keys
```

Salin `Public Key` ke:

`admin/assets/push-config.js`

```js
window.RH_PUSH_CONFIG = {
  vapidPublicKey: 'BH2-Ruc4z1daSYb82e1gbSZ29i1NLejYrtl90lUwvuGvyMz2x63pmnAbwS2U0GaH-h3bGiFaUcyEXV9nL87qPto'
}
```

## 3. Deploy Supabase Edge Functions
Deploy:

```bash
supabase functions deploy send-lead-push
supabase functions deploy lead-push-reminder
```

Set secrets:

```bash
supabase secrets set VAPID_SUBJECT="mailto:restuharmoni@gmail.com"
supabase secrets set VAPID_PUBLIC_KEY="BH2-Ruc4z1daSYb82e1gbSZ29i1NLejYrtl90lUwvuGvyMz2x63pmnAbwS2U0GaH-h3bGiFaUcyEXV9nL87qPto"
supabase secrets set VAPID_PRIVATE_KEY="PRIVATE_KEY_DARI_GENERATOR_ANDA"
```

`SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` biasanya tersedia di Edge Functions. Jika tidak, set juga:

```bash
supabase secrets set SUPABASE_URL="https://PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY_DI_SINI"
```

## 4. Jadual reminder setiap 5 minit
Di Supabase Dashboard > Edge Functions > `lead-push-reminder`, tambah schedule:

```cron
*/5 * * * *
```

Fungsi ini akan cari lead yang status bukan:
`converted, prospect, qualified_prospect, archived, closed, lost, deleted`

dan hantar push semula setiap 5 minit.

## 5. Immediate push untuk lead baru
Ada 2 pilihan:

### Pilihan A — Database Webhook Supabase Dashboard
Supabase Dashboard > Database Webhooks:
- Table: `leads`
- Event: `INSERT`
- Method: POST
- URL: `https://PROJECT_REF.supabase.co/functions/v1/send-lead-push`
- Header: `Authorization: Bearer SERVICE_ROLE_KEY`
- Body custom JSON:

```json
{
  "mode": "single",
  "lead_id": "{{ record.id }}",
  "push_type": "new_lead"
}
```

### Pilihan B — SQL pg_net trigger
Dalam SQL migration ada template trigger yang dikomen. Isi Vault secret dahulu kemudian uncomment.

## 6. Cara aktifkan phone
1. Deploy website ke Cloudflare/HTTPS.
2. Buka `/admin/dashboard.html` atau `/admin/leads.html` di phone.
3. Login admin.
4. Tekan **Aktifkan Push**.
5. Tekan **Allow**.
6. Tekan **Test Notification**.
7. Install PWA ke Home Screen untuk pengalaman terbaik.

## Nota penting iPhone
Untuk iPhone, Web Push biasanya perlu PWA dipasang ke Home Screen dahulu dan permission notification diberi dari PWA itu.


## Update 20 Jun — Public Key sudah dimasukkan
Fail `admin/assets/push-config.js` sudah diisi dengan VAPID Public Key.

Untuk keselamatan, VAPID Private Key **tidak dimasukkan** ke mana-mana fail frontend/ZIP. Masukkan Private Key sebagai Supabase Secret sahaja.

Gunakan subject tanpa bracket/space:

```bash
supabase secrets set VAPID_SUBJECT="mailto:restuharmoni@gmail.com"
```
