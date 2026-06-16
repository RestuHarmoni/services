# RH Admin V1.5 - Quotation Module V1.0

Status: Ready for beta QA.

## Included
- `/admin/quotations.html`
- Quotation list and KPI cards
- Generate quotation from prospect
- Package quick pick: RH Basic, RH Starter, RH Growth, RH Ecosystem, Custom
- Quotation items auto generated
- Auto subtotal, discount, tax, grand total
- Status flow: Draft, Sent, Accepted, Rejected, Expired
- Quotation preview layout with RH branding
- Print / PDF via browser print
- Prospect stage sync:
  - Generate / Sent -> Proposal Sent
  - Accepted -> Won
  - Rejected -> Lost

## SQL
Run:

```text
supabase/migrations/20260612210000_rh_admin_v1_5_quotation_module.sql
```

## QA
1. Open `/admin/prospects.html`.
2. Click `Proposal` on a prospect.
3. Open `/admin/quotations.html`.
4. Confirm quotation appears.
5. Click `View`.
6. Test `Print / PDF`, `Mark Sent`, `Accepted`, `Rejected`.
