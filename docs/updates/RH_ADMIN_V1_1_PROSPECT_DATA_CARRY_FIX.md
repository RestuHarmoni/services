# RH Admin V1.1 - Prospect Data Carry Forward Fix

## Purpose
This patch fixes the Prospect module so converted leads carry important sales information into the prospect record.

## Fixed
- Carry forward objective, budget, timeline and recommended package.
- Carry forward lead score and lead temperature.
- Carry forward domain / website status where available from Aira answers.
- Prospect detail can display Aira answers using `lead_id`.
- Stage labels now show friendly text such as `New Prospect` instead of `new_prospect`.
- Invalid test leads are blocked from conversion.
- Existing prospects can be backfilled by running the SQL migration.

## SQL
Run:

`supabase/migrations/20260612183000_rh_admin_v1_prospect_data_carry_fix.sql`

## QA
1. Run SQL migration.
2. Create a new Aira lead.
3. Open `/admin/leads.html`.
4. Click `Prospect` on the complete lead.
5. Open `/admin/prospects.html`.
6. Click `View`.
7. Confirm budget, timeline, package, lead score, temperature and Aira answers appear.
