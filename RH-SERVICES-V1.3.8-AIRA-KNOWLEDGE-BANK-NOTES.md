# RH Services v1.3.8 - Aira Knowledge Bank & Sales Question Flow

## Base
services-main-update-v1.3.7-article-admin-preview-seo-editor.zip

## Module Diubah
Aira Knowledge / Aira Sales Question Flow sahaja.

## File Diubah
- content/aira-question-bank.json
- content/aira-faq-bank.json
- aira-lead-system.js
- aira-data-service.js
- aira-v3-sales-consultant-patch.js
- admin/aira-knowledge.html
- admin/assets/admin.css
- index.html (cache bust Aira scripts sahaja)
- supabase/migrations/20260616170000_rh_admin_v1_3_8_aira_knowledge_bank.sql

## Fungsi
- Bank soalan Aira lebih lengkap.
- 4 pakej rasmi: RH Basic, RH Growth, RH Ecosystem, RH Enterprise.
- Recommendation logic ikut business type, domain, hosting, objective, feature need, budget dan timeline.
- FAQ Knowledge dikemaskini.
- Admin Aira Knowledge page boleh lihat dan publish official bank.

## SQL
Perlu run migration v1.3.8 untuk upsert `aira_settings`.
Tiada DROP TABLE. Tiada DELETE DATA.

## Module Locked Tidak Disentuh
Leads, Prospects, Quotations, Invoices, Projects, Subscriptions, Articles, Dashboard.
