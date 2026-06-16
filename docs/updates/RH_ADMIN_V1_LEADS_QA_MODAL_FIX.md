# RH Admin V1 Leads QA Modal Fix

Fixes:
- Modal hidden state now works via `.modal-backdrop[hidden]`.
- Lead detail modal now renders lead fields properly.
- Lead detail modal now loads `lead_answers` from Supabase and displays Aira answers.

QA target:
- `/admin/leads.html` loads lead list.
- Click View opens populated lead detail.
- Lead with Aira answers shows all question/answer records.
