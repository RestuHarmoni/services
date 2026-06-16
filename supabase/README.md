# RH Services Supabase Setup

Run migrations in order.

Important current patches:

1. `migrations/20260611089400_rh_services_v894_stabilization.sql`
   - Creates/aligns `leads`, `lead_answers`, `aira_settings`, `blog_posts`, storage bucket `blog-images`, and RLS policies.

2. `migrations/20260611100000_rh_services_v100_package_alignment.sql`
   - Seeds official Aira package bank.
   - Normalizes legacy package names to official RH packages.
   - Adds package price fields for next Sales Workspace / Quotation Filing phase.

Official packages:

- RH Starter — RM1299, maintenance RM129/bulan
- RH Growth — RM1999, maintenance RM179/bulan
- RH Ecosystem — RM2999, maintenance RM249/bulan

Legacy package names are kept only for migration/reference, not for new leads.
