# RH Admin Article Module V1.0 - Full Build

## Included
- Articles dashboard.
- Create article.
- Edit article.
- Delete article with admin password.
- Draft / Published / Archived.
- SEO title, SEO description, focus keyword.
- Category and author.
- Featured article flag.
- Cover image upload to Supabase Storage `blog-images`.
- Public article preview link.
- Soft delete fields and audit activity log.

## SQL
Run:

`supabase/migrations/20260613007000_rh_admin_article_module_v1_full_build.sql`

## QA
1. Open `/admin/articles.html`.
2. Create draft.
3. Upload cover image.
4. Publish article.
5. Confirm it appears on `/blog.html`.
6. Open public article link.
7. Delete article with `DELETE` + admin password.
