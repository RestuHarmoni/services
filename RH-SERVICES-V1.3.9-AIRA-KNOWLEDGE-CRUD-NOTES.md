# RH SERVICES v1.3.9 — Aira Knowledge CRUD Management

Base: services-main-update-v1.3.8-aira-knowledge-bank.zip

Module diubah: Aira Knowledge sahaja.

File diubah:
- admin/aira-knowledge.html
- admin/assets/admin.css

Fungsi ditambah:
- Add Package
- Add Question
- Add FAQ
- Edit Package / Question / FAQ
- Duplicate
- Draft / Publish toggle
- Secure Delete dengan admin password + DELETE confirmation
- Soft delete dalam JSON bank: is_deleted, deleted_at, deleted_by, delete_reason
- Restore draft untuk item deleted sebelum publish
- Search dan filter status
- Publish Changes ke aira_settings

SQL: Tidak diperlukan.

Module lain tidak disentuh:
Leads, Prospects, Quotations, Invoices, Payments, Projects, Subscriptions, Articles, Dashboard.
