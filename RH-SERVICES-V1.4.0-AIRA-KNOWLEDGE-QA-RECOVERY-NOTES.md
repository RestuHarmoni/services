# RH Services v1.4.0 — Aira Knowledge QA Recovery

Base: services-main-update-v1.3.9-aira-knowledge-crud-management.zip

Module changed:
- Aira Knowledge only

Files changed:
- admin/aira-knowledge.html
- aira-data-service.js

SQL:
- Not required

Fixes:
- Fixed broken inline JavaScript that caused editor fields not to render.
- Fixed Aira data-service validation so v1.3.9/v1.4.0 knowledge bank versions can load.
- Rebuilt Aira Knowledge UI into stable card sections:
  - Packages
  - Sales Flow Questions
  - FAQ Knowledge
- Added proper modal editor for package, question and FAQ.
- Added Add, Edit, Duplicate, Draft/Publish, Delete/Restore draft workflow.
- Added responsive layout for mobile/tablet/desktop.

Locked modules not touched:
- Leads
- Prospects
- Quotations
- Invoices
- Projects
- Subscriptions
- Articles
- Dashboard
