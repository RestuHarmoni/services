# Setup Edge Functions Tanpa VS Code (Supabase Browser Editor)

Tujuan: aktifkan push notification phone walaupun dashboard ditutup.

## A. Secrets
Pergi ke Supabase Dashboard → Edge Functions → Secrets.
Pastikan 3 secrets ini sudah ada:

- VAPID_SUBJECT
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY

Jangan masukkan secrets dalam SQL Editor.

## B. Create Function: send-lead-push
1. Pergi ke Edge Functions → Functions.
2. Klik **Open Editor**.
3. Create new function dengan nama tepat:

```text
send-lead-push
```

4. Buka fail `index.ts`.
5. Copy semua isi fail ini dari ZIP:

```text
supabase/functions/send-lead-push/index.ts
```

6. Paste dalam editor Supabase.
7. Save / Deploy.

## C. Create Function: lead-push-reminder
1. Create new function kedua dengan nama tepat:

```text
lead-push-reminder
```

2. Copy semua isi fail ini dari ZIP:

```text
supabase/functions/lead-push-reminder/index.ts
```

3. Paste dalam editor Supabase.
4. Save / Deploy.

## D. SQL Migration
Pergi ke SQL Editor dan run fail:

```text
supabase/migrations/20260620103000_rh_push_no_telegram_v1.sql
```

SQL ini create:

- push_subscriptions
- lead_push_logs

## E. Selepas function wujud
Pergi ke Edge Functions → Functions.
Mesti nampak:

- send-lead-push
- lead-push-reminder

Kalau belum nampak, phone push tidak akan berjalan apabila dashboard ditutup.

## F. Test
1. Deploy website ZIP ke Cloudflare.
2. Buka dashboard di phone.
3. Tekan Aktifkan Push.
4. Tekan Allow.
5. Semak table `push_subscriptions` ada rekod baru.
6. Buat lead baru.
7. Function `send-lead-push` perlu dipanggil oleh trigger SQL / manual test.

## Nota penting
Reminder setiap 5 minit memerlukan scheduled call ke function `lead-push-reminder`.
Jika Supabase cron belum disambungkan, reminder tidak akan berjalan automatik.
