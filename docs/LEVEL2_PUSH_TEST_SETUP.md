# Level 2 Notification Patch

Fail yang ditambah/diubah:
- `admin/leads.html` — panel Phone Notification dengan butang Aktifkan Push dan Test Notification.
- `admin/assets/admin.js` — PWA registration, enable push, test notification, simpan subscription ke Supabase.
- `sw.js` — push event dan notification click handler.
- `manifest.json` + `manifest.webmanifest` — PWA manifest.
- `supabase/push_subscriptions.sql` — table untuk simpan device subscription.

Cara test cepat:
1. Deploy ke Cloudflare/GitHub.
2. Buka `/admin/leads.html` di Chrome/Edge.
3. Tekan `Test Notification`.
4. Allow notification jika diminta.
5. Notification test akan keluar dari browser/device.

Untuk push sebenar dari server:
1. Jalankan SQL `supabase/push_subscriptions.sql` di Supabase SQL Editor.
2. Generate VAPID key.
3. Letak public key sebagai `window.RH_VAPID_PUBLIC_KEY` atau simpan di browser localStorage untuk test.
4. Tekan `Aktifkan Push` supaya device subscription disimpan.
5. Sambung Edge Function/server sender untuk broadcast bila lead baru masuk.
