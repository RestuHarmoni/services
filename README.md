# Services Restu Harmoni

Production static website for Services Restu Harmoni.

## Public Lead Flow
- Public website does not expose direct WhatsApp number.
- All public CTA buttons open the Aira popup.
- Aira answers FAQ, qualifies leads, collects client WhatsApp, and saves to Supabase `leads`.

## Admin
- `admin.html` = content/template admin
- `admin-leads.html` = Supabase lead management

## Supabase
Config: `supabase-config.js`
Schema: `SUPABASE_LEADS_SCHEMA.sql`


## v5.3.6 CSP Hotfix
- Allow Cloudflare Insights beacon script in CSP.
- Allow jsDelivr source-map/devtools connection to avoid console CSP noise.
- Bumped version.js and service worker cache.
