# Aira V3 Safe Live Base

Built from `services-main-update 16jun.zip`.

## Changes
- Keeps existing Aira popup structure.
- Adds `aira-v3-sales-consultant-patch.js` after existing Aira lead system.
- Reduces first screen to 4 actions:
  - Lihat Pakej
  - Harga Pakej RH
  - Lihat Contoh Website
  - Dapatkan Cadangan
- Adds RH Basic RM799.
- Adds domain_status and hosting_status in Aira lead payload.
- Updates package recommendation and lead score.
- Adds `/pakej/rh-basic/`.

## SQL
Run:
`supabase/migrations/20260616093000_rh_aira_v3_safe_live_base.sql`
only if Aira still loads old bank from Supabase.
