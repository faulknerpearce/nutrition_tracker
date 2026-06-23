-- 0002_auth_and_user_scoping.sql
-- Multi-user auth: profiles table, user_id on food_entries, RLS.
--
-- Run in the Supabase SQL editor. Idempotent where practical.
-- Prerequisites: food_entries table from initial schema + 0001_add_entry_date.sql

-- ---------------------------------------------------------------------------
-- 1. Profiles (app-level user record; auth lives in auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 2. Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. Scope food_entries to users
-- ---------------------------------------------------------------------------
alter table public.food_entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Orphan rows (pre-auth dev data) cannot be assigned; remove before NOT NULL.
delete from public.food_entries where user_id is null;

alter table public.food_entries
  alter column user_id set not null;

create index if not exists food_entries_user_date_idx
  on public.food_entries (user_id, entry_date, created_at);

alter table public.food_entries enable row level security;

drop policy if exists "Users can view own entries" on public.food_entries;
create policy "Users can view own entries"
  on public.food_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own entries" on public.food_entries;
create policy "Users can insert own entries"
  on public.food_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own entries" on public.food_entries;
create policy "Users can update own entries"
  on public.food_entries for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own entries" on public.food_entries;
create policy "Users can delete own entries"
  on public.food_entries for delete
  using (auth.uid() = user_id);