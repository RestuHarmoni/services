# RH Services v1.3.5 — Article Recovery Seed & SEO Restore

Base: `services-main-update-v1.3.4-mobile-card-tables-all-admin.zip`

## Scope
Articles / Blog module only.

## File Added
- `supabase/migrations/20260616162000_rh_admin_v1_3_5_article_recovery_seed.sql`

## File Modified
None.

## Locked Modules Not Touched
- Leads
- Prospects
- Quotations
- Invoices
- Payments
- Projects
- Subscriptions
- Dashboard
- Login
- Settings

## SQL Required
Run:

```sql
supabase/migrations/20260616162000_rh_admin_v1_3_5_article_recovery_seed.sql
```

## SQL Safety
- No `DROP TABLE`
- No `DELETE DATA`
- Uses `CREATE TABLE IF NOT EXISTS`
- Uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- Uses `INSERT ... ON CONFLICT(slug) DO UPDATE`

## Articles Restored
1. Kenapa Bisnes Perlu Website
2. Website vs Facebook Page Untuk Bisnes
3. Cara Buat Website Untuk Bisnes Kecil Di Malaysia
4. Website Sebagai Portfolio Digital Ejen Hartanah
5. Google Business Profile Untuk PMKS
6. SEO Lokal: Cara Mudah Dapat Pelanggan Dari Google
7. 5 Tanda Bisnes Anda Perlukan Website
8. Kesilapan PMKS Yang Bergantung 100% Pada Media Sosial
9. Bagaimana AI Chatbot Membantu Menjawab Pelanggan 24/7
10. Kos Sebenar Membina Website Untuk Bisnes Di Malaysia

## QA After Deploy
1. Run SQL migration.
2. Open Admin > Articles.
3. Confirm Total Articles = 10.
4. Open public `blog.html`.
5. Confirm 10 published articles are visible.
6. Open one article detail from public blog.
7. Share one article to WhatsApp/Facebook and confirm preview uses title and image.
