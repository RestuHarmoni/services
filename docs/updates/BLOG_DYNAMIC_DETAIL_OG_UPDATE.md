# Blog Dynamic Detail + OG Image Update

Version: v1-public-blog-detail-og

## Purpose

Enable dynamic article detail pages using the existing SEO-friendly URL format:

```text
/blog/{slug}.html
```

The page is rendered by `_worker.js` using data from Supabase `blog_posts`.

## What changed

- `_worker.js` now renders `/blog/{slug}.html` dynamically.
- OG tags are injected server-side for Facebook / WhatsApp preview:
  - `og:title`
  - `og:description`
  - `og:image`
  - `og:url`
  - `og:type=article`
- Worker uses current host origin, so beta and live generate correct URLs.
- Worker reads Supabase config from Cloudflare env variables first:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- If env variables are not set, worker falls back to reading `supabase-config.js` from deployed assets.

## Required blog_posts columns

```sql
title text
slug text
category text
cover_image text
meta_title text
meta_description text
content text
status text
published_at timestamptz
updated_at timestamptz
```

## QA

1. Open blog listing:

```text
/blog.html
```

2. Click `Baca`.

3. Expected URL:

```text
/blog/panduan-website-bisnes-kecil.html
```

4. Expected result:

- Article page loads cleanly.
- No homepage mixed layout.
- Cover image appears.
- Facebook share preview uses article image.

## Note

For best production practice, set Cloudflare Pages environment variables for beta/live separately so worker never points to the wrong Supabase project.
