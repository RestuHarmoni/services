# RH Admin V1.4 - Prospect Sales Pipeline Engine

## Added
- Prospect KPI cards: Data Review, Proposal Sent, Negotiation, Won, Lost, Conversion Rate.
- Official sales stages: `data_review`, `proposal_sent`, `negotiation`, `won`, `lost`.
- Prospect detail tabs: Overview, Aira Answers, Sales Timeline, Internal Notes.
- Sales timeline log via `prospect_stage_logs`.
- Lost reason modal with reason and notes.
- Proposal, Negotiation, Won, Lost actions from list and detail modal.

## Migration
Run:

```text
supabase/migrations/20260612200000_rh_admin_v1_4_prospect_pipeline_engine.sql
```

## QA
1. Open `/admin/prospects.html`.
2. Check KPI cards.
3. Click View and switch tabs.
4. Click Proposal, Negotiation, Won, Lost.
5. Confirm timeline appears in Sales Timeline tab.
