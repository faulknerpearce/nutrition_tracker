-- 0004_goals_and_macros.sql
-- Per-user nutrition goals on profiles; fat and fiber on food_entries.
--
-- Run in the Supabase SQL editor after 0003_activities.sql.

-- ---------------------------------------------------------------------------
-- 1. Fat and fiber on food entries
-- ---------------------------------------------------------------------------
alter table public.food_entries
  add column if not exists fat integer not null default 0;

alter table public.food_entries
  add column if not exists fiber integer not null default 0;

-- ---------------------------------------------------------------------------
-- 2. Per-user nutrition goals (JSON on profiles)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists nutrition_goals jsonb not null default '{
    "calories": { "value": 3000, "low": 2800, "high": 3200 },
    "protein":  { "value": 150,  "low": 120,  "high": 170 },
    "carbs":    { "value": 250,  "low": 200,  "high": 300 },
    "caffeine": { "value": 400,  "low": 0,    "high": 400 },
    "fat":      { "value": 65,   "low": 50,   "high": 80 },
    "fiber":    { "value": 30,   "low": 25,   "high": 35 }
  }'::jsonb;