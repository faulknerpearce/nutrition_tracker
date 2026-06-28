-- Portion metadata for food entries (servings or grams) and optional recipe serving weight.

alter table public.food_entries
  add column if not exists portion_unit text,
  add column if not exists portion_quantity numeric(8, 2),
  add column if not exists reference_weight_grams numeric(8, 2);

alter table public.food_entries
  drop constraint if exists food_entries_portion_unit_check;

alter table public.food_entries
  add constraint food_entries_portion_unit_check
  check (portion_unit is null or portion_unit in ('servings', 'grams'));

alter table public.food_entries
  drop constraint if exists food_entries_portion_quantity_check;

alter table public.food_entries
  add constraint food_entries_portion_quantity_check
  check (portion_quantity is null or portion_quantity > 0);

alter table public.food_entries
  drop constraint if exists food_entries_reference_weight_grams_check;

alter table public.food_entries
  add constraint food_entries_reference_weight_grams_check
  check (reference_weight_grams is null or reference_weight_grams > 0);

alter table public.recipes
  add column if not exists serving_weight_grams numeric(8, 2);

alter table public.recipes
  drop constraint if exists recipes_serving_weight_grams_check;

alter table public.recipes
  add constraint recipes_serving_weight_grams_check
  check (serving_weight_grams is null or serving_weight_grams > 0);