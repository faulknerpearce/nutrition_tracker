-- 0006_recipes.sql
-- Saved recipes (meal templates) with ingredient lines.
--
-- Run in the Supabase SQL editor after 0005_profile_body_stats.sql.

-- ---------------------------------------------------------------------------
-- 1. Recipes (user-scoped meal templates)
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  description      text not null default '',
  icon             text not null default 'fa-utensils',
  icon_bg          text not null default '#f4f4f5',
  icon_color       text not null default '#71717a',
  default_servings numeric(4, 2) not null default 1,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.recipes
  drop constraint if exists recipes_default_servings_check;

alter table public.recipes
  add constraint recipes_default_servings_check
  check (default_servings > 0);

create index if not exists recipes_user_updated_idx
  on public.recipes (user_id, updated_at desc);

alter table public.recipes enable row level security;

drop policy if exists "Users can view own recipes" on public.recipes;
create policy "Users can view own recipes"
  on public.recipes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own recipes" on public.recipes;
create policy "Users can insert own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own recipes" on public.recipes;
create policy "Users can update own recipes"
  on public.recipes for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own recipes" on public.recipes;
create policy "Users can delete own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. Recipe ingredients (macro lines per recipe)
-- ---------------------------------------------------------------------------
create table if not exists public.recipe_ingredients (
  id          uuid primary key default gen_random_uuid(),
  recipe_id   uuid not null references public.recipes(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  sort_order  integer not null default 0,
  name        text not null,
  amount      text not null default '',
  calories    integer not null default 0,
  protein     integer not null default 0,
  carbs       integer not null default 0,
  fat         integer not null default 0,
  fiber       integer not null default 0,
  caffeine    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists recipe_ingredients_recipe_sort_idx
  on public.recipe_ingredients (recipe_id, sort_order);

alter table public.recipe_ingredients enable row level security;

drop policy if exists "Users can view own recipe ingredients" on public.recipe_ingredients;
create policy "Users can view own recipe ingredients"
  on public.recipe_ingredients for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own recipe ingredients" on public.recipe_ingredients;
create policy "Users can insert own recipe ingredients"
  on public.recipe_ingredients for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own recipe ingredients" on public.recipe_ingredients;
create policy "Users can update own recipe ingredients"
  on public.recipe_ingredients for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own recipe ingredients" on public.recipe_ingredients;
create policy "Users can delete own recipe ingredients"
  on public.recipe_ingredients for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Optional provenance on food log entries
-- ---------------------------------------------------------------------------
alter table public.food_entries
  add column if not exists recipe_id uuid references public.recipes(id) on delete set null;

alter table public.food_entries
  add column if not exists servings_logged numeric(4, 2);

alter table public.food_entries
  drop constraint if exists food_entries_servings_logged_check;

alter table public.food_entries
  add constraint food_entries_servings_logged_check
  check (servings_logged is null or servings_logged > 0);