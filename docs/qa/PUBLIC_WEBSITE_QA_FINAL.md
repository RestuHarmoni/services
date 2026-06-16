# RH Services Public Website QA Final

Status: READY FOR BETA DEPLOY QA
Version: v1-public-qa-final
Date: 2026-06-12

## QA Scope

1. Blog Detail
2. Facebook Share OG Image
3. WhatsApp Share Preview
4. SEO
5. Error Audit

## Result Summary

| Area | Status | Notes |
|---|---|---|
| Homepage | PASS | Public homepage remains active. |
| Aira | PASS | Aira UI and flow verified during beta QA. |
| Lead Capture | PASS | `leads` and `lead_answers` inserts reached 201 during beta QA. |
| Blog Listing | PASS | `blog_posts` read works after Supabase table setup. |
| Blog Detail | READY FOR DEPLOY TEST | `/blog/{slug}.html` is handled by `_worker.js` and rendered from Supabase. |
| Facebook OG Image | READY FOR DEPLOY TEST | `_worker.js` injects server-side OG tags using `blog_posts.cover_image`. |
| WhatsApp Preview | READY FOR DEPLOY TEST | Uses the same server-side OG tags. |
| SEO | PASS/READY | Dynamic canonical, meta description, Article schema, and dynamic sitemap are included. |
| Public PWA | REMOVED | Public site no longer registers SW; old SW/cache will be unregistered/cleared from `app.js`. |

## Required Supabase `blog_posts` Columns

```text
title
slug
category
cover_image
meta_title
meta_description
content
status
published_at
updated_at
```

## Deploy QA Checklist

After uploading this ZIP to beta repo, test:

```text
https://beta.services.restuharmoni.com/blog.html
https://beta.services.restuharmoni.com/blog/panduan-website-bisnes-kecil.html
https://beta.services.restuharmoni.com/sitemap.xml
```

Expected:

```text
Blog listing → article card appears
Baca button → /blog/{slug}.html opens clean article detail
View source of article detail → og:title, og:description, og:image exist
Console → no critical red errors
Network → no critical 404 for blog_posts, article, cover image, supabase
```

## Facebook / WhatsApp Preview

Use article URL:

```text
https://beta.services.restuharmoni.com/blog/panduan-website-bisnes-kecil.html
```

Expected preview:

```text
Cover image from blog_posts.cover_image
Title from blog_posts.title or meta_title
Description from blog_posts.meta_description
```

## Notes

Google Reviews remains HOLD because it will be managed later from Admin V1 Settings, not public dynamic QA.
