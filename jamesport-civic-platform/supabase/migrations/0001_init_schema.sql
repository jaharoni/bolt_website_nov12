-- Jamesport Civic Platform base schema
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  contact_email text,
  timezone text default 'America/New_York',
  created_at timestamptz not null default now()
);

insert into public.tenants (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'jamesport', 'Jamesport Civic Association')
on conflict (slug) do nothing;

create type public.event_category as enum (
  'ownership',
  'zoning',
  'proposal',
  'hearing',
  'legislation',
  'enforcement',
  'community'
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  description text not null,
  event_type public.event_category not null,
  date date not null,
  source_url text,
  tags text[] default '{}',
  documents jsonb default '[]'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger timeline_events_set_updated
before update on public.timeline_events
for each row execute function public.touch_updated_at();

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  alert_prefs jsonb not null default jsonb_build_object(
    'general', true,
    'meetings', true,
    'volunteer', false
  ),
  volunteer_role text,
  committee_interest text,
  preferred_channel text default 'email',
  confirmed boolean not null default false,
  confirmation_token uuid,
  confirmed_at timestamptz,
  double_opt_in_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated
before update on public.users
for each row execute function public.touch_updated_at();

create table if not exists public.scraped_updates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  source_url text not null,
  source_label text,
  content text not null,
  detected_at timestamptz not null default now(),
  parsed_payload jsonb,
  processed boolean not null default false,
  alert_sent boolean not null default false,
  keywords text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.scraper_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  source_url text,
  level text not null default 'info',
  message text not null,
  context jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_timeline_events_tenant_date on public.timeline_events (tenant_id, date desc);
create index if not exists idx_users_tenant_email on public.users (tenant_id, email);
create index if not exists idx_scraped_updates_processed on public.scraped_updates (processed, alert_sent);
