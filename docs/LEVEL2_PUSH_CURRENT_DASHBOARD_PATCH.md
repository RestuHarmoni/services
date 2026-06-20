# Level 2 Push Notification - Current Dashboard Patch

Patch ini pindahkan/aktifkan butang **Aktifkan Push** dan **Test Notification** pada dashboard admin semasa:

- `admin/dashboard.html` - panel Phone Notification
- `admin/leads.html` - panel Lead Phone Notification
- `admin/assets/admin.js` - service worker registration, permission request, push subscription save, test notification
- `manifest.json` dan `sw.js` - asas PWA + push handler
- `supabase/push_subscriptions.sql` - table untuk simpan device subscription

Nota: Test Notification boleh diuji terus selepas deploy HTTPS. Push automatik lead baru masih perlukan VAPID key + server/edge function sender.
