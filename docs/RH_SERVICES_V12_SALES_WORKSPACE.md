# RH Services v12.0 Sales Workspace Rebuild

Status: Production cleanup + sales workflow upgrade.

## Principle

`leads` remains the single source of truth. No separate `prospects`, `quotations`, `won_projects`, or `lost_deals` tables are introduced in this version.

## Sales Flow

Aira → Lead Inbox → Prospect → Quotation → Negotiation → Won / Lost → Office RH handover.

## Sales Stages

- `new` = Lead Inbox
- `prospect` = Qualified prospect
- `quotation` = Quotation created/sent
- `negotiation` = Follow-up / negotiation
- `won` = Closed deal
- `lost` = Lost deal

## New Lead Fields

- `sales_stage`
- `sales_notes`
- `followup_date`
- `assigned_to`
- `quotation_number`
- `quotation_status`
- `quotation_amount`
- `maintenance_amount`
- `won_date`
- `lost_reason`
- `last_activity_at`

## Admin Workspace

`admin-leads.html` now works as a Sales Workspace with:

- Sales KPI cards
- Stage tabs
- Lead Inbox
- Prospect file drawer
- Aira answers
- Sales notes
- Follow-up date
- Quotation filing
- Mark Won / Mark Lost actions
- Office RH handover placeholder

## Safe Deploy Notes

Run:

```text
supabase/migrations/20260611120000_rh_services_v120_sales_workspace.sql
```

after uploading the files.

Existing Aira, lead capture, blog, and package template links are not changed.
