# RH Admin Secure Delete Engine V1.0

Modules covered:
- Prospects
- Quotations
- Invoices
- Projects

Security behaviour:
1. User clicks Delete.
2. User must type `DELETE`.
3. User must re-enter active staff password.
4. Record is soft-deleted using `deleted_at`, `deleted_by`, `is_deleted`.
5. Action is logged into `audit_logs`.

Business rules:
- Accepted quotations are locked.
- Paid / partial-paid invoices are locked.
- Projects in development/review/delivery/completed/cancelled are locked.
- Prospects can be archived unless later business rules block them.

No hard delete is performed.
