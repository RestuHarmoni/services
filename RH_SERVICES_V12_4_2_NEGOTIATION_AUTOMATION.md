# RH Services v12.4.2 Negotiation Automation

## Scope
Patch ini menyambungkan Quotation kepada Negotiation tanpa mengubah Aira, Lead Inbox, Prospect Detail atau Blog.

## Perubahan Utama

1. Version bump kepada `v12.4.2-negotiation-automation`.
2. Tambah data store `negotiations` dalam local Sales Workspace.
3. Quotation Register kini ada action `Send To Negotiation`.
4. Quotation Kanban kini ada stage `Negotiation`.
5. Negotiation page disusun semula sebagai Sales Follow Up Workspace.
6. Negotiation Register memaparkan:
   - NEG ID
   - Prospect
   - Quotation No
   - Amount
   - Status
   - Next Follow Up
7. Negotiation Detail membenarkan:
   - Status update
   - Last Contact
   - Next Follow Up
   - Follow Up Notes Timeline
8. Dashboard Negotiation KPI kini baca nilai active negotiation.

## Workflow QA

Aira → Lead Inbox → Convert Prospect → Create Quotation → Send To Negotiation → Negotiation Register → Update Status / Add Notes.

## Nota
Tiada SQL baru diperlukan. Patch ini tidak mengubah table Supabase sedia ada.
