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
  fat: number
  fiber: number
}

export type NewFoodEntry = Omit<FoodEntry, 'id'>
export type UpdateFoodEntry = Partial<NewFoodEntry>

export type Totals = {
  calories: number
  protein: number
  carbs: number
  caffeine: number
  fat: number
  fiber: number
}

export type ActivityRow = Database['public']['Tables']['activities']['Row']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']
export type ActivityUpdate = Database['public']['Tables']['activities']['Update']

export interface Activity {
  id: string
  name: string
  activityType: string
  activityDate: string
  distanceMeters: number | null
  movingTimeSeconds: number
  averageHeartrate: number | null
  maxHeartrate: number | null
  calories: number | null
}

export type NewActivity = Omit<Activity, 'id' | 'activityDate'>
export type UpdateActivity = Partial<NewActivity>

export type ActivityTotals = {
  calories: number
  movingTimeSeconds: number
  distanceMeters: number
}
