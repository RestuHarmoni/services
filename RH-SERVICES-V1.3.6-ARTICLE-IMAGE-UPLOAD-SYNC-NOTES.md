# RH SERVICES v1.3.6 — Article Image Upload Sync Fix

## Base
services-main-update-v1.3.5-article-recovery-seed.zip

## Module Changed
Articles / Blog only.

## Files Changed
- admin/articles.html
- admin/assets/admin.js

## Fixes
- Article Dashboard buttons now bind correctly: New, Refresh, Save Draft, Publish, Preview, Edit, Publish/Unpublish, Delete.
- Upload cover image now saves public URL into `blog_posts.cover_image` during Save/Publish.
- Added `Sync Storage Images` button to map images from Supabase Storage bucket `blog-images/articles` to blog posts still using RH logo fallback.
- No changes to Leads, Prospects, Quotations, Invoices, Projects, Subscriptions, Dashboard, Login, Settings.

## SQL
Not required.

## QA Steps
1. Open Admin → Articles.
2. Edit an article.
3. Upload PNG/JPG/WEBP cover image.
4. Click Publish / Save.
5. Confirm `blog_posts.cover_image` becomes a Supabase public URL, not `/assets/rh-logo.png`.
6. Open `/blog` and confirm cover image loads.
7. Use `Sync Storage Images` only for existing posts that still use RH logo.
