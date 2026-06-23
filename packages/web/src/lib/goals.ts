import {
  DEFAULT_NUTRITION_GOALS,
  parseNutritionGoals,
  type NutritionGoals,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export type { NutritionGoals }

export async function fetchUserGoals(userId: string): Promise<NutritionGoals> {
  const { data, error } = await supabase
    .from('profiles')
    .select('nutrition_goals')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return parseNutritionGoals(data?.nutrition_goals ?? DEFAULT_NUTRITION_GOALS)
}

export async function saveUserGoals(userId: string, goals: NutritionGoals): Promise<NutritionGoals> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ nutrition_goals: goals })
    .eq('id', userId)
    .select('nutrition_goals')
    .single()

  if (error) throw new Error(error.message)
  return parseNutritionGoals(data.nutrition_goals)
}