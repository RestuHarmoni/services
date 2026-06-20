# Level 2 Push Notification Hotfix 2

Perubahan:
- Service worker register guna absolute path `/sw.js` dan scope `/`.
- Test Notification ada fallback `new Notification()` jika `registration.showNotification()` gagal.
- Status debug dipaparkan dalam dashboard: HTTPS, permission, service worker, push manager, enabled.
- Jika notification blocked, dashboard akan beritahu buka Site Settings > Notifications > Allow.

Cara test:
1. Deploy ZIP ke Cloudflare/GitHub.
2. Buka `https://services.restuharmoni.com/admin/dashboard.html`.
3. Hard refresh / clear cache jika perlu.
4. Klik `Aktifkan Push` dan pilih `Allow`.
5. Klik `Test Notification`.

Nota device:
- Android Chrome/Edge: notification boleh keluar terus selepas Allow.
- Desktop Chrome/Edge: notification boleh keluar selepas Allow.
- iPhone/iOS: web push biasanya perlu website di-install sebagai PWA melalui Safari Add to Home Screen, kemudian buka dari icon PWA.
