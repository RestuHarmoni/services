# RH SERVICES V1.3.3 - ADMIN RESPONSIVE QA PATCH

Base File: services-main-update-v1.3.2-subscription-status-secure-edit-delete.zip
Status: PATCH
SQL: Tidak diperlukan

## Module Diubah
- Admin UI responsive layer
- Subscription table responsive cleanup

## File Diubah
- admin/assets/admin.css
- admin/assets/subscriptions.css

## Fix
- Dashboard disesuaikan untuk phone, tablet, laptop, PC, Android, iPhone dan MacBook.
- Sidebar mobile kekal off-canvas.
- Topbar mobile dikemaskan.
- Dashboard cards auto susun mengikut saiz skrin.
- Chart container lebih stabil di phone/tablet.
- Panel dan content tidak menyebabkan page horizontal overflow.
- Subscription action buttons wrap dengan lebih kemas.
- Subscription desktop table dikurangkan kebergantungan horizontal scroll.

## Module Locked Tidak Disentuh
- Leads logic
- Prospects logic
- Quotation logic
- Invoice logic
- Payment logic
- Project logic
- Subscription business logic
- Database / SQL

## QA Target
- Phone Android: 360px-430px
- iPhone: 375px-430px
- Tablet: 768px-1024px
- Laptop: 1280px-1366px
- MacBook: 1440px+
- PC: 1920px+
