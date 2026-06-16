# RH Admin V1 - Prospect Module

## Scope
- Build functional `admin/prospects.html`.
- Convert Lead → Prospect from Leads module.
- Add manual prospect form.
- Prospect pipeline listing with search and stage filter.
- Prospect detail modal with original Aira answers when linked to a lead.
- Update stages: `new_prospect`, `proposal_sent`, `won`.

## Database
Run:

```text
supabase/migrations/20260612180000_rh_admin_v1_prospect_module.sql
```

## QA Checklist
- Convert a lead from `/admin/leads.html`.
- Confirm new row appears in `/admin/prospects.html`.
- Confirm `prospects` table has a row with `lead_id`.
- Click View and confirm prospect info + Aira answers appear.
- Add manual prospect and confirm it appears in the list.
- Update stage to Proposal / Won.

## Notes
This module prepares the handoff to Quotation V1.
