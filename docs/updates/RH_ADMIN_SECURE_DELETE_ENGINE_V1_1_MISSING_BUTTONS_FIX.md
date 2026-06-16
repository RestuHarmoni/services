# RH Admin Secure Delete Engine V1.1 – Missing Delete Buttons Fix

## Scope
- Restores visible Delete buttons for Quotations, Invoices and Projects.
- Keeps secure confirmation flow: type DELETE + admin password.
- Keeps soft delete and audit log behaviour.
- Does not change database schema.

## Notes
Delete buttons are visible even when a record is locked, but business rules still protect critical records:
- Accepted quotations are blocked from deletion.
- Paid or partial-paid invoices are blocked from deletion.
- Projects in development/review/delivery/completed/cancelled are blocked from deletion.

This makes the action visible while still preventing unsafe deletion.
