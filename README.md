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


## v5.4.0 Blog CMS
- Admin Panel now includes Blog CMS with clean responsive UI.
- Public Blog page: blog.html
- Public Article page: article.html?slug=your-slug
- Run SUPABASE_BLOG_CMS_V1.sql before using Blog CMS.


## Blog Image Upload
- Run `SUPABASE_BLOG_IMAGE_STORAGE_V1.sql` once in Supabase SQL Editor to enable Admin Panel image upload for article cover images.
- Bucket used: `blog-images`. Max upload: 5MB. Supported: JPG, PNG, WebP, GIF.


## v5.4.3 Blog Image Display Fix
- Service worker cache bumped to v5.4.3.
- CSP img-src updated to allow blob preview images in Admin Panel.
- Blog and article cover images now render using <img> fallback instead of CSS background only.
- Admin preview now shows clear fallback/error message if Supabase Storage URL cannot load.

## v6.1.1 Auto Publish Blog OG
- Added Cloudflare Pages Worker `_worker.js`.
- `/blog/{slug}.html` is generated dynamically from Supabase `blog_posts`.
- Facebook/WhatsApp OG tags now use `cover_image`, `meta_title`, and `meta_description` directly from Supabase.
- `/article.html?slug=...` redirects to `/blog/{slug}.html`.
- `/sitemap.xml` is generated dynamically with published blog posts.
- Admin Blog CMS no longer requires manual SEO ZIP export for daily publishing.


## v6.1.1
- Tambah button Share pada kad blog listing.
- Tambah Share Facebook, WhatsApp dan Salin Link pada halaman artikel.
- Share link menggunakan URL SEO `/blog/slug.html`.
- Service worker cache bump ke v6.1.1.

## v10.0 Package Alignment

Official RH packages are now locked as:

- RH Basic — RM799, maintenance RM79/bulan
- RH Starter — RM1299, maintenance RM129/bulan
- RH Growth — RM1999, maintenance RM179/bulan
- RH Ecosystem — RM2999, maintenance RM249/bulan

Aira and future Sales Workspace / Quotation Filing must use these package labels only.

After deploy, run:

`supabase/migrations/20260611100000_rh_services_v100_package_alignment.sql`

Uploaded template packages are mapped under:

`rh-packages/templates/`


## RH Admin Quotation Module V1.0.4

Single Source Quotation Template: preview dan print/PDF kini menggunakan source template yang sama, dengan print root khas untuk A4 professional.

## RH Admin V1.6.1 — Invoice V1.1 Deposit / Discount Update

Run SQL:

```text
supabase/migrations/20260612224500_rh_admin_v1_6_1_invoice_deposit_discount.sql
```

QA route:

```text
/admin/invoices.html → + New Invoice → discount/deposit → Generate → Record Payment
```

## Update: Invoice Module V1.1.2 — Supabase Header Fix

Patch for invoice generation error: `No API key found in request`.

Run SQL:

```text
supabase/migrations/20260612230500_rh_admin_v1_6_3_invoice_supabase_header_fix.sql
```

Then test `/admin/invoices.html` → `+ New Invoice` → Generate Invoice.

## Invoice Module V1.1.4 - Modal Action Bar Fix
- Fix invoice preview action bar overlap.
- Buttons no longer cover Balance Due / total text.
- Print/PDF action buttons remain hidden.


## RH Admin Payment Module V1.0.1
Run: `supabase/migrations/20260612234000_rh_admin_payment_module_v1_0_1.sql`

QA: `/admin/invoices.html` → View Invoice → Paid → upload receipt → Save Payment.
