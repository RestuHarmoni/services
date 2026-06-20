# Level 2 Phone Notification - Status Sebenar

Patch ini aktifkan 2 jenis notification:

## 1. Local/PWA notification semasa dashboard terbuka
- Klik **Aktifkan Push**.
- Klik **Test Notification**.
- Bila lead baru masuk, sistem akan cuba realtime Supabase.
- Jika realtime tidak jalan, sistem guna polling fallback setiap 10 saat semasa dashboard/admin PWA masih terbuka.

## 2. Phone notification walaupun browser/app tutup
Ini belum boleh berfungsi hanya dengan JavaScript frontend. Ia perlukan server push:

- VAPID public/private key.
- Device subscription disimpan dalam `push_subscriptions`.
- Supabase Edge Function/Backend untuk hantar Web Push.
- Database trigger atau cron/edge function yang dipanggil setiap kali lead baru masuk.

Tanpa server push, phone tidak akan terima notification apabila dashboard/PWA ditutup.

## Semakan wajib
1. Deploy fail terbaru.
2. Buka dashboard melalui HTTPS.
3. Clear cache / update PWA.
4. Tekan **Aktifkan Push** dan pilih Allow.
5. Tekan **Test Notification**.
6. Biarkan dashboard/PWA terbuka, kemudian submit new lead.

Jika test keluar tetapi new lead tidak keluar, semak sama ada table `leads` boleh dibaca oleh admin session dan Supabase config sudah betul.
