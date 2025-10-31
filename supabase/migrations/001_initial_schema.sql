-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- User security table for MFA tracking
create table if not exists user_security (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mfa_enrolled boolean not null default false,
  last_mfa_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Backup codes table (hashed storage)
create table if not exists user_backup_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null, -- salted hash, never plaintext
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Broker connections table (encrypted tokens)
create table if not exists broker_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker text not null,
  access_token_enc bytea not null,
  refresh_token_enc bytea,
  expires_at timestamptz,
  scopes text[],
  created_at timestamptz default now(),
  revoked_at timestamptz,
  unique(user_id, broker)
);

-- Row Level Security (RLS) Policies
alter table user_security enable row level security;
alter table user_backup_codes enable row level security;
alter table broker_connections enable row level security;

-- RLS Policies for user_security
create policy "Users can view their own security settings"
  on user_security for select
  using (auth.uid() = user_id);

create policy "Users can update their own security settings"
  on user_security for update
  using (auth.uid() = user_id);

create policy "Users can insert their own security settings"
  on user_security for insert
  with check (auth.uid() = user_id);

-- RLS Policies for user_backup_codes
create policy "Users can view their own backup codes"
  on user_backup_codes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own backup codes"
  on user_backup_codes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own backup codes"
  on user_backup_codes for update
  using (auth.uid() = user_id);

-- RLS Policies for broker_connections
create policy "Users can view their own broker connections"
  on broker_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own broker connections"
  on broker_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own broker connections"
  on broker_connections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own broker connections"
  on broker_connections for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_user_backup_codes_user_id on user_backup_codes(user_id);
create index if not exists idx_user_backup_codes_used_at on user_backup_codes(used_at);
create index if not exists idx_broker_connections_user_id on broker_connections(user_id);
create index if not exists idx_broker_connections_revoked_at on broker_connections(revoked_at);

