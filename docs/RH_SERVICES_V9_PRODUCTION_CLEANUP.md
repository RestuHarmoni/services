# RH Services v9.0 Production Cleanup

Status: Safe cleanup patch.

## Fokus

1. Centralized Supabase client melalui `supabase-config.js`.
2. Kurangkan risiko warning `Multiple GoTrueClient instances detected`.
3. Bump cache/version kepada `v9.0-production-cleanup`.
4. Kekalkan flow live Aira, Leads, Blog, Admin dan Worker.

## Prinsip patch

- Tiada perubahan besar pada UX live.
- Tiada rename table Supabase.
- Tiada migration destructive.
- Semua module yang perlukan Supabase perlu guna `window.RHGetSupabaseClient()`.

## Test wajib selepas deploy

1. Home load tanpa error merah.
2. Console tiada warning GoTrueClient berganda.
3. Aira submit lead berjaya.
4. `lead_answers` masuk.
5. Admin Leads boleh buka detail.
6. Blog list boleh baca artikel published.
7. `/sitemap.xml` boleh dibuka.
