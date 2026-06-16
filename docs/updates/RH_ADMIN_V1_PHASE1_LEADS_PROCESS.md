# RH Admin V1 Phase 1 - Leads Process

Status: Beta QA

## Included

- Staff login remains active.
- Dashboard menu links now route to real admin pages.
- Leads module added at `/admin/leads.html`.
- Leads can be searched and filtered by status.
- Lead detail modal added.
- Lead status can be changed to `contacted` or `qualified`.
- Lead can be converted to Prospect.
- Placeholder pages added for future modules so sidebar routes do not 404.
- Supabase SQL fixed: no unsupported `create policy if not exists` syntax.
- Password hash corrected for `rh123456`.

## QA Account

```text
SUPER001
rh123456
```

## SQL to run

If the full foundation SQL was already run, run only:

```text
supabase/migrations/20260612170000_rh_admin_v1_phase1_leads_fix.sql
```

If setting up from fresh beta database, run:

```text
supabase/migrations/20260612160000_rh_admin_v1_foundation.sql
```

## Admin routes

```text
/admin/login.html
/admin/dashboard.html
/admin/leads.html
```

Other pages are placeholder routes for the next phase.
