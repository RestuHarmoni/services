# RH Admin Project Module V1.1 – Workflow & Task Engine

## Purpose
Stabilise delivery workflow after Invoice/Payment is completed.

## Changes
- New projects start at `onboarding`, not completed.
- Default progress is `0%`.
- Project checklist is generated from invoice/package data.
- Progress follows completed tasks.
- Completed project is locked only after all tasks are done.
- Project timeline records task and stage changes.

## QA
1. Create project from paid/partial paid invoice.
2. Confirm default status is Onboarding.
3. Confirm progress starts at 0%.
4. Tick checklist tasks.
5. Confirm progress increases.
6. Move pipeline stages.
7. Complete only after all tasks are done.
