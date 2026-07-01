-- 0017_profile_gender_bmr.sql
-- Gender for BMR calculation and optional manual BMR override.
--
-- Run in the Supabase SQL editor after 0016_recipient_dismiss_recipe_shares.sql.

alter table public.profiles
  add column if not exists gender text not null default 'female',
  add column if not exists bmr_override numeric(6, 1);

alter table public.profiles
  drop constraint if exists profiles_gender_check;

alter table public.profiles
  add constraint profiles_gender_check
  check (gender in ('male', 'female', 'prefer_not_to_say'));

alter table public.profiles
  drop constraint if exists profiles_bmr_override_check;

alter table public.profiles
  add constraint profiles_bmr_override_check
  check (bmr_override is null or (bmr_override >= 800 and bmr_override <= 5000));