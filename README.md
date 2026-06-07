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
