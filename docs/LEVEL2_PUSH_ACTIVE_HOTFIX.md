# Level 2 Push Active Hotfix

Patch ini mengaktifkan fungsi notification pada dashboard semasa.

## Apa yang aktif sekarang

1. Butang **Aktifkan Push** minta permission notification daripada browser.
2. Setting disimpan dalam `localStorage` sebagai `RH_PUSH_LOCAL_ENABLED=1`.
3. Butang **Test Notification** terus keluarkan notification test melalui Service Worker.
4. Dashboard subscribe kepada Supabase Realtime table `leads`.
5. Bila lead baru masuk, notification keluar semasa dashboard/PWA sedang terbuka atau aktif di browser.

## Untuk notification walaupun dashboard ditutup

Masih perlukan VAPID key + server sender/Edge Function. Hotfix ini memastikan fungsi notification yang boleh diuji terus aktif dahulu.
