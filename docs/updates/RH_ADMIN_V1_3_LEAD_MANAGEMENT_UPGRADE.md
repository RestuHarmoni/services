# RH Admin V1.3 - Lead Management Upgrade

## Added
- Edit Lead from Lead Inbox and Lead Detail modal.
- Soft delete/archive lead for SUPER_ADMIN.
- Force Convert for SUPER_ADMIN when a lead has abnormal/test data.
- Converted and Archived filters.
- Duplicate phone warning in Lead Inbox.
- Lead fields expanded: email, company, domain_status, hosting_status, updated_at, deleted_at, deleted_by.
- Lead Activity Logs table foundation.

## QA
1. Run SQL migration.
2. Open `/admin/leads.html`.
3. Test Edit → Save Changes.
4. Test Contacted / Qualified.
5. Test Prospect on normal lead.
6. Test Force Prospect on abnormal lead as SUPER_ADMIN.
7. Test Delete/Archive as SUPER_ADMIN.

## Notes
- Delete is soft delete only. It sets `status='archived'`, `deleted_at`, and `deleted_by`.
- Production RLS must be tightened before live production use.
