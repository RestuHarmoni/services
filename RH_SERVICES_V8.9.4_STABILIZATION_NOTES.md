# RH Services v8.9.4 Stabilization Patch

## Objective
Stabilize the live services.restuharmoni.com repo without refactoring active functions.

## Changes
- Added safe Supabase migration aligned with current live code tables.
- Added `/supabase/README.md` setup note.
- Updated app version strings to `v8.9.4-stabilization`.
- Updated Service Worker cache version and admin redirect version.
- Fixed Aira avatar references from missing `.webp` to existing `.svg`.
- Added OG/Twitter image tags to blog and service pages.

## Not Changed
- No Aira flow refactor.
- No admin UI restructure.
- No localStorage module removal.
- No table rename/destructive migration.

## Deploy Steps
1. Upload/deploy this ZIP to GitHub/Cloudflare.
2. Run `supabase/migrations/20260611089400_rh_services_v894_stabilization.sql` in Supabase SQL Editor.
3. Test lead submit in incognito.
4. Test Admin Leads and Blog image upload.
5. Test phone without clearing cache; SW version should refresh.
