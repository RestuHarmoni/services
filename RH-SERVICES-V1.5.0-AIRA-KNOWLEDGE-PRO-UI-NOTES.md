# RH Services v1.5.0 — Aira Knowledge Professional Admin UI

Base: services-main-update-v1.4.0-aira-knowledge-qa-recovery.zip

Module changed: Aira Knowledge only.

Files changed:
- admin/aira-knowledge.html

SQL: Not required.

Fixes:
- Rebuilt Aira Knowledge template into professional admin layout.
- Added tabbed management: Questions, FAQ, Packages, Archive.
- Replaced messy card-only layout with desktop table + mobile card layout.
- Fixed Edit, Duplicate, Draft/Publish, Delete and Restore button handlers.
- Editor now opens in proper modal popup.
- Secure soft delete flow: type DELETE + password + reason.
- Uses Aira Data Service publish flow to update aira_settings.

Locked modules not touched:
- Leads
- Prospects
- Quotations
- Invoices
- Projects
- Subscriptions
- Articles
- Dashboard
