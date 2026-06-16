-- RH Admin Article Module V1.0 - Full Build
-- Safe/idempotent migration for Supabase beta/live.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  category text default 'Website',
  status text default 'draft',
  content text,
  cover_image text,
  meta_title text,
  meta_description text,
  seo_title text,
  seo_description text,
  focus_keyword text,
  excerpt text,
  author text default 'RH Admin',
  is_featured boolean default false,
  featured boolean default false,
  views integer default 0,
  view_count integer default 0,
  published_at timestamptz,
  is_deleted boolean default false,
  deleted_at timestamptz,
  deleted_by text,
  delete_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blog_posts
  add column if not exists category text default 'Website',
  add column if not exists status text default 'draft',
  add column if not exists content text,
  add column if not exists cover_image text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists focus_keyword text,
  add column if not exists excerpt text,
  add column if not exists author text default 'RH Admin',
  add column if not exists is_featured boolean default false,
  add column if not exists featured boolean default false,
  add column if not exists views integer default 0,
  add column if not exists view_count integer default 0,
  add column if not exists published_at timestamptz,
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by text,
  add column if not exists delete_reason text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists blog_posts_slug_unique_idx on public.blog_posts(slug) where slug is not null;
create index if not exists blog_posts_status_idx on public.blog_posts(status);
create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc);
create index if not exists blog_posts_deleted_idx on public.blog_posts(is_deleted, deleted_at);

alter table public.blog_posts enable row level security;

drop policy if exists "public_read_published_blog_posts" on public.blog_posts;
create policy "public_read_published_blog_posts"
on public.blog_posts
for select
to anon
using (
  coalesce(is_deleted,false) = false
  and deleted_at is null
  and status in ('published','draft','archived')
);

drop policy if exists "admin_insert_blog_posts_beta" on public.blog_posts;
create policy "admin_insert_blog_posts_beta"
on public.blog_posts
for insert
to anon
with check (true);

drop policy if exists "admin_update_blog_posts_beta" on public.blog_posts;
create policy "admin_update_blog_posts_beta"
on public.blog_posts
for update
to anon
using (true)
with check (true);

-- Storage bucket for article cover images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/jpg'])
on conflict (id) do update set public = true;

drop policy if exists "public_read_blog_images" on storage.objects;
create policy "public_read_blog_images"
on storage.objects
for select
to anon
using (bucket_id = 'blog-images');

drop policy if exists "admin_insert_blog_images_beta" on storage.objects;
create policy "admin_insert_blog_images_beta"
on storage.objects
for insert
to anon
with check (bucket_id = 'blog-images');

drop policy if exists "admin_update_blog_images_beta" on storage.objects;
create policy "admin_update_blog_images_beta"
on storage.objects
for update
to anon
using (bucket_id = 'blog-images')
with check (bucket_id = 'blog-images');
