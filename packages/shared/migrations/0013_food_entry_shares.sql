-- 0013_food_entry_shares.sql
-- User-to-user sharing for logged food entries.
--
-- Run in the Supabase SQL editor after 0012_recipe_workout_shares.sql.

create table if not exists public.food_entry_shares (
  id                      uuid primary key default gen_random_uuid(),
  food_entry_id           text not null references public.food_entries(id) on delete cascade,
  owner_id                uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id     uuid not null references auth.users(id) on delete cascade,
  owner_display_name      text not null,
  shared_with_display_name text not null,
  saved_copy_id           text references public.food_entries(id) on delete set null,
  created_at              timestamptz not null default now(),
  unique (food_entry_id, shared_with_user_id)
);

create index if not exists food_entry_shares_recipient_idx
  on public.food_entry_shares (shared_with_user_id, created_at desc);

create index if not exists food_entry_shares_owner_idx
  on public.food_entry_shares (owner_id, created_at desc);

alter table public.food_entry_shares enable row level security;

drop policy if exists "Users can view relevant food entry shares" on public.food_entry_shares;
create policy "Users can view relevant food entry shares"
  on public.food_entry_shares for select
  using (auth.uid() = owner_id or auth.uid() = shared_with_user_id);

drop policy if exists "Owners can create food entry shares" on public.food_entry_shares;
create policy "Owners can create food entry shares"
  on public.food_entry_shares for insert
  with check (
    auth.uid() = owner_id
    and shared_with_user_id <> auth.uid()
    and exists (
      select 1 from public.food_entries
      where id = food_entry_id and user_id = auth.uid()
    )
  );

drop policy if exists "Recipients can update food entry share saved copy" on public.food_entry_shares;
create policy "Recipients can update food entry share saved copy"
  on public.food_entry_shares for update
  using (auth.uid() = shared_with_user_id)
  with check (auth.uid() = shared_with_user_id);

drop policy if exists "Owners can revoke food entry shares" on public.food_entry_shares;
create policy "Owners can revoke food entry shares"
  on public.food_entry_shares for delete
  using (auth.uid() = owner_id);

drop policy if exists "Users can view food entries shared with them" on public.food_entries;
create policy "Users can view food entries shared with them"
  on public.food_entries for select
  using (
    exists (
      select 1 from public.food_entry_shares es
      where es.food_entry_id = food_entries.id
        and es.shared_with_user_id = auth.uid()
    )
  );