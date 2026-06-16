-- RH Services v8.9.4 Stabilization Patch
-- Safe additive schema for current live code.
-- Run in Supabase SQL Editor after deploy.

create extension if not exists pgcrypto;

create or replace function public.rh_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1) Aira leads table used by aira-lead-system.js and admin-leads.html
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  business_type text,
  objective text,
  budget text,
  timeline text,
  recommended_package text,
  lead_score integer default 0,
  lead_temperature text default 'WARM',
  status text not null default 'NEW',
  notes text,
  source text default 'Aira',
  page_url text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads add column if not exists name text;
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists business_type text;
alter table public.leads add column if not exists objective text;
alter table public.leads add column if not exists budget text;
alter table public.leads add column if not exists timeline text;
alter table public.leads add column if not exists recommended_package text;
alter table public.leads add column if not exists lead_score integer default 0;
alter table public.leads add column if not exists lead_temperature text default 'WARM';
alter table public.leads add column if not exists status text default 'NEW';
alter table public.leads add column if not exists notes text;
alter table public.leads add column if not exists source text default 'Aira';
alter table public.leads add column if not exists page_url text;
alter table public.leads add column if not exists user_agent text;
alter table public.leads add column if not exists created_at timestamptz default now();
alter table public.leads add column if not exists updated_at timestamptz default now();

create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_temperature on public.leads(lead_temperature);

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at before update on public.leads for each row execute function public.rh_set_updated_at();

-- 2) Detailed Aira answers used by admin-leads.html
create table if not exists public.lead_answers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  question_key text,
  question text,
  answer text,
  sort_order integer default 0,
  answer_type text default 'choice',
  created_at timestamptz not null default now()
);

create index if not exists idx_lead_answers_lead_id on public.lead_answers(lead_id);
create index if not exists idx_lead_answers_order on public.lead_answers(lead_id, sort_order);

-- 3) Aira settings used by aira-data-service.js
create table if not exists public.aira_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 4) Blog CMS used by admin-blog.js, blog.html and _worker.js
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text default 'SEO',
  cover_image text,
  meta_title text,
  meta_description text,
  keywords jsonb not null default '[]'::jsonb,
  content text,
  status text not null default 'draft',
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts add column if not exists title text;
alter table public.blog_posts add column if not exists slug text;
alter table public.blog_posts add column if not exists category text default 'SEO';
alter table public.blog_posts add column if not exists cover_image text;
alter table public.blog_posts add column if not exists meta_title text;
alter table public.blog_posts add column if not exists meta_description text;
alter table public.blog_posts add column if not exists keywords jsonb default '[]'::jsonb;
alter table public.blog_posts add column if not exists content text;
alter table public.blog_posts add column if not exists status text default 'draft';
alter table public.blog_posts add column if not exists published_at timestamptz default now();
alter table public.blog_posts add column if not exists created_at timestamptz default now();
alter table public.blog_posts add column if not exists updated_at timestamptz default now();

create unique index if not exists idx_blog_posts_slug_unique on public.blog_posts(slug);
create index if not exists idx_blog_posts_status_published on public.blog_posts(status, published_at desc);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at before update on public.blog_posts for each row execute function public.rh_set_updated_at();

-- 5) Storage bucket for blog cover images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880;

-- 6) RLS
alter table public.leads enable row level security;
alter table public.lead_answers enable row level security;
alter table public.aira_settings enable row level security;
alter table public.blog_posts enable row level security;

-- Drop/recreate named policies so patch is repeatable without duplicate errors.
drop policy if exists "rh_public_insert_leads" on public.leads;
drop policy if exists "rh_admin_read_leads" on public.leads;
drop policy if exists "rh_admin_update_leads" on public.leads;
drop policy if exists "rh_public_insert_lead_answers" on public.lead_answers;
drop policy if exists "rh_admin_read_lead_answers" on public.lead_answers;
drop policy if exists "rh_public_read_aira_settings" on public.aira_settings;
drop policy if exists "rh_admin_write_aira_settings" on public.aira_settings;
drop policy if exists "rh_public_read_published_blog" on public.blog_posts;
drop policy if exists "rh_admin_manage_blog" on public.blog_posts;

create policy "rh_public_insert_leads" on public.leads
  for insert to anon, authenticated
  with check (true);

create policy "rh_admin_read_leads" on public.leads
  for select to authenticated
  using (true);

create policy "rh_admin_update_leads" on public.leads
  for update to authenticated
  using (true)
  with check (true);

create policy "rh_public_insert_lead_answers" on public.lead_answers
  for insert to anon, authenticated
  with check (true);

create policy "rh_admin_read_lead_answers" on public.lead_answers
  for select to authenticated
  using (true);

create policy "rh_public_read_aira_settings" on public.aira_settings
  for select to anon, authenticated
  using (true);

create policy "rh_admin_write_aira_settings" on public.aira_settings
  for all to authenticated
  using (true)
  with check (true);

create policy "rh_public_read_published_blog" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published' or auth.role() = 'authenticated');

create policy "rh_admin_manage_blog" on public.blog_posts
  for all to authenticated
  using (true)
  with check (true);

-- Storage policies for blog image upload and public read.
drop policy if exists "rh_public_read_blog_images" on storage.objects;
drop policy if exists "rh_admin_insert_blog_images" on storage.objects;
drop policy if exists "rh_admin_update_blog_images" on storage.objects;
drop policy if exists "rh_admin_delete_blog_images" on storage.objects;

create policy "rh_public_read_blog_images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'blog-images');

create policy "rh_admin_insert_blog_images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog-images');

create policy "rh_admin_update_blog_images" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog-images')
  with check (bucket_id = 'blog-images');

create policy "rh_admin_delete_blog_images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog-images');
