create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription jsonb not null,
  staff_id text,
  user_agent text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Allow authenticated/admin push subscriptions read" on public.push_subscriptions;
create policy "Allow authenticated/admin push subscriptions read"
  on public.push_subscriptions for select
  using (true);

drop policy if exists "Allow push subscription upsert" on public.push_subscriptions;
create policy "Allow push subscription upsert"
  on public.push_subscriptions for insert
  with check (true);

drop policy if exists "Allow push subscription update" on public.push_subscriptions;
create policy "Allow push subscription update"
  on public.push_subscriptions for update
  using (true)
  with check (true);
