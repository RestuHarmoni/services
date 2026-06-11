# RH Services Supabase Setup

Run migrations in order. For current live code, the important patch is:

`migrations/20260611089400_rh_services_v894_stabilization.sql`

It creates/aligns:

- `leads`
- `lead_answers`
- `aira_settings`
- `blog_posts`
- Storage bucket `blog-images`
- RLS policies for public lead insert, public published blog read, admin management.

The older `rh_leads` and `rh_aira_sessions` tables are kept untouched for backward compatibility.
