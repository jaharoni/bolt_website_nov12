create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  phone text,
  volunteer_role text,
  alert_prefs jsonb default '{}'::jsonb,
  general_opt_in boolean default true,
  meeting_opt_in boolean default true,
  volunteer_opt_in boolean default false,
  sms_opt_in boolean default false,
  confirmed boolean default false,
  confirmation_token uuid,
  confirmation_sent_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now())
);

create table if not exists public.timeline_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  date date not null,
  event_type text not null,
  tags text[] default '{}',
  source_url text,
  documents jsonb default '[]'::jsonb,
  location text,
  status text default 'draft',
  created_by uuid,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz
);
create index if not exists timeline_events_date_idx on public.timeline_events (date);
create index if not exists timeline_events_type_idx on public.timeline_events (event_type);

create table if not exists public.scraped_updates (
  id uuid primary key default uuid_generate_v4(),
  source_url text not null,
  content text not null,
  detected_at timestamptz default timezone('utc'::text, now()),
  processed boolean default false,
  alert_sent boolean default false,
  matched_keywords text[] default '{}',
  meeting_date date
);
create index if not exists scraped_updates_detected_idx on public.scraped_updates (detected_at desc);

create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  role text default 'editor',
  created_at timestamptz default timezone('utc'::text, now())
);
