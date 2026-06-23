import type { Database } from './database.js'

export type FoodRow = Database['public']['Tables']['food_entries']['Row']
export type FoodInsert = Database['public']['Tables']['food_entries']['Insert']
export type FoodUpdate = Database['public']['Tables']['food_entries']['Update']

export interface FoodEntry {
  id: string
  icon: string
  iconBg: string
  iconColor: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  caffeine: number
}

export type NewFoodEntry = Omit<FoodEntry, 'id'>
export type UpdateFoodEntry = Partial<NewFoodEntry>

export type Totals = {
  calories: number
  protein: number
  carbs: number
  caffeine: number
}
