# RH Admin V1.2 - Prospect Edit Module

## Added
- Edit button in Prospect Pipeline.
- Edit Prospect modal.
- Editable fields: name, phone, email, company, business type, objective, budget, timeline, package, sales stage, domain, hosting/website, assigned staff, follow-up date, internal notes.
- Save changes back to Supabase `prospects`.
- Activity log entry for prospect edits.
- Data Review stage label and badge.

## SQL
Run:

```text
supabase/migrations/20260612190000_rh_admin_v1_2_prospect_edit_module.sql
```

## QA
1. Open `/admin/prospects.html`.
2. Click `Edit`.
3. Update fields.
4. Save.
5. Click `View` and confirm updated values appear.
