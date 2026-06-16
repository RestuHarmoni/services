# RH Admin V1.7 — Project Module V1.0

## Status
Project Module V1.0 added.

## Scope
- `/admin/projects.html`
- Generate project from invoice with status `partial_paid` or `paid`
- Auto project number: `PRJ-YYYY-0001`
- Project KPI dashboard
- Project list and search/filter
- Project detail modal
- Project status pipeline
- Project timeline
- Invoice → Project bridge button

## Pipeline
Invoice payment received → Project created → Onboarding → Content Collection → Design → Development → Review → Delivery → Completed.

## Database
- `projects`
- `project_timeline`

## QA
1. Run SQL migration.
2. Open `/admin/projects.html`.
3. Click `+ New Project`.
4. Select partial paid/paid invoice.
5. Generate project.
6. Move status through pipeline.
