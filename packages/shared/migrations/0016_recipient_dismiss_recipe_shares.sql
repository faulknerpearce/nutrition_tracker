-- 0016_recipient_dismiss_recipe_shares.sql
-- Allow share recipients to remove items from their Shared With Me list.

drop policy if exists "Recipients can dismiss recipe shares" on public.recipe_shares;
create policy "Recipients can dismiss recipe shares"
  on public.recipe_shares for delete
  using (auth.uid() = shared_with_user_id);

drop policy if exists "Recipients can dismiss food entry shares" on public.food_entry_shares;
create policy "Recipients can dismiss food entry shares"
  on public.food_entry_shares for delete
  using (auth.uid() = shared_with_user_id);

drop policy if exists "Recipients can dismiss activity shares" on public.activity_shares;
create policy "Recipients can dismiss activity shares"
  on public.activity_shares for delete
  using (auth.uid() = shared_with_user_id);

drop policy if exists "Recipients can dismiss workout shares" on public.workout_shares;
create policy "Recipients can dismiss workout shares"
  on public.workout_shares for delete
  using (auth.uid() = shared_with_user_id);