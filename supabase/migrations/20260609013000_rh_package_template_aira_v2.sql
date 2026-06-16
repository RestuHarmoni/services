-- RH Supabase schema: Aira lead system only
-- Template customizer, demo template and package-template registry removed from this source.

create extension if not exists pgcrypto;

create table if not exists public.rh_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  location text,
  service_type text,
  business_goal text,
  package_recommended text,
  template_selected text,
  source text not null default 'website',
  status text not null default 'new',
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rh_aira_sessions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.rh_leads(id) on delete set null,
  session_key text,
  service_type text,
  messages jsonb not null default '[]'::jsonb,
  recommendation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.rh_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_rh_leads_updated_at on public.rh_leads;
create trigger trg_rh_leads_updated_at before update on public.rh_leads for each row execute function public.rh_set_updated_at();

drop trigger if exists trg_rh_aira_sessions_updated_at on public.rh_aira_sessions;
create trigger trg_rh_aira_sessions_updated_at before update on public.rh_aira_sessions for each row execute function public.rh_set_updated_at();

create index if not exists idx_rh_leads_status_created on public.rh_leads(status, created_at desc);
create index if not exists idx_rh_aira_sessions_lead on public.rh_aira_sessions(lead_id);

alter table public.rh_leads enable row level security;
alter table public.rh_aira_sessions enable row level security;
