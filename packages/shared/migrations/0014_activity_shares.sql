-- 0014_activity_shares.sql
-- User-to-user sharing for logged activities.
--
-- Run in the Supabase SQL editor after 0013_food_entry_shares.sql.

create table if not exists public.activity_shares (
  id                      uuid primary key default gen_random_uuid(),
  activity_id             uuid not null references public.activities(id) on delete cascade,
  owner_id                uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id     uuid not null references auth.users(id) on delete cascade,
  owner_display_name      text not null,
  shared_with_display_name text not null,
  saved_copy_id           uuid references public.activities(id) on delete set null,
  created_at              timestamptz not null default now(),
  unique (activity_id, shared_with_user_id)
);

create index if not exists activity_shares_recipient_idx
  on public.activity_shares (shared_with_user_id, created_at desc);

create index if not exists activity_shares_owner_idx
  on public.activity_shares (owner_id, created_at desc);

alter table public.activity_shares enable row level security;

drop policy if exists "Users can view relevant activity shares" on public.activity_shares;
create policy "Users can view relevant activity shares"
  on public.activity_shares for select
  using (auth.uid() = owner_id or auth.uid() = shared_with_user_id);

drop policy if exists "Owners can create activity shares" on public.activity_shares;
create policy "Owners can create activity shares"
  on public.activity_shares for insert
  with check (
    auth.uid() = owner_id
    and shared_with_user_id <> auth.uid()
    and exists (
      select 1 from public.activities
      where id = activity_id and user_id = auth.uid()
    )
  );

drop policy if exists "Recipients can update activity share saved copy" on public.activity_shares;
create policy "Recipients can update activity share saved copy"
  on public.activity_shares for update
  using (auth.uid() = shared_with_user_id)
  with check (auth.uid() = shared_with_user_id);

drop policy if exists "Owners can revoke activity shares" on public.activity_shares;
create policy "Owners can revoke activity shares"
  on public.activity_shares for delete
  using (auth.uid() = owner_id);

drop policy if exists "Users can view activities shared with them" on public.activities;
create policy "Users can view activities shared with them"
  on public.activities for select
  using (
    exists (
      select 1 from public.activity_shares s
      where s.activity_id = activities.id
        and s.shared_with_user_id = auth.uid()
    )
  );

drop policy if exists "Users can view exercises of shared activities" on public.activity_exercises;
create policy "Users can view exercises of shared activities"
  on public.activity_exercises for select
  using (
    exists (
      select 1 from public.activity_shares s
      where s.activity_id = activity_exercises.activity_id
        and s.shared_with_user_id = auth.uid()
    )
  );