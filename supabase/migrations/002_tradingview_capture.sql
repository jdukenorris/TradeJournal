-- TradingView Dual Timeframe Capture schema
-- Creates tables: captures, capture_images, devices, layouts, capture_events, dead_letters
-- Adds RLS policies to restrict access to row owner (auth.uid())

create extension if not exists pgcrypto;

-- captures
create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  requested_tfs text[] not null default array['1h','5m'],
  zoom_profile jsonb,
  requested_at timestamptz not null default now(),
  mode_used text check (mode_used in ('A','B')),
  status text not null default 'queued',
  device_id uuid,
  constraint captures_device_fk foreign key (device_id) references public.devices(id)
    on delete set null
);

-- devices
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('extension','electron')),
  name text,
  last_seen_at timestamptz,
  online boolean not null default false,
  capabilities jsonb,
  token_hash text
);

-- layouts
create table if not exists public.layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  label text not null,
  modeA_url text,
  modeB_view_only_url text,
  "default" boolean not null default false
);

-- capture_images
create table if not exists public.capture_images (
  id uuid primary key default gen_random_uuid(),
  capture_id uuid not null references public.captures(id) on delete cascade,
  tf text not null,
  object_key text not null,
  cdn_url text,
  sha256 text,
  width int,
  height int,
  captured_at timestamptz not null default now()
);

-- capture_events
create table if not exists public.capture_events (
  id uuid primary key default gen_random_uuid(),
  capture_id uuid not null references public.captures(id) on delete cascade,
  step text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- dead_letters
create table if not exists public.dead_letters (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  reason text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.captures enable row level security;
alter table public.capture_images enable row level security;
alter table public.devices enable row level security;
alter table public.layouts enable row level security;
alter table public.capture_events enable row level security;

-- policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'captures' and policyname = 'captures_select_own'
  ) then
    create policy captures_select_own on public.captures
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'captures' and policyname = 'captures_modify_own'
  ) then
    create policy captures_modify_own on public.captures
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'capture_images' and policyname = 'capture_images_select_own'
  ) then
    create policy capture_images_select_own on public.capture_images
      for select using (
        exists (
          select 1 from public.captures c where c.id = capture_id and c.user_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'capture_images' and policyname = 'capture_images_insert_via_server'
  ) then
    create policy capture_images_insert_via_server on public.capture_images
      for insert with check (
        exists (
          select 1 from public.captures c where c.id = capture_id and c.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'devices' and policyname = 'devices_select_own'
  ) then
    create policy devices_select_own on public.devices
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'devices' and policyname = 'devices_modify_own'
  ) then
    create policy devices_modify_own on public.devices
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'layouts' and policyname = 'layouts_select_own_or_public'
  ) then
    create policy layouts_select_own_or_public on public.layouts
      for select using (user_id is null or user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'layouts' and policyname = 'layouts_modify_own'
  ) then
    create policy layouts_modify_own on public.layouts
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'capture_events' and policyname = 'capture_events_select_own'
  ) then
    create policy capture_events_select_own on public.capture_events
      for select using (
        exists (
          select 1 from public.captures c where c.id = capture_id and c.user_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'capture_events' and policyname = 'capture_events_insert_own'
  ) then
    create policy capture_events_insert_own on public.capture_events
      for insert with check (
        exists (
          select 1 from public.captures c where c.id = capture_id and c.user_id = auth.uid()
        )
      );
  end if;
end $$;


