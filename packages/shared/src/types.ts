import type { Database } from './database.js'
import type { PortionMeta, PortionUnit } from './portionScaling.js'

export type { PortionMeta, PortionUnit }

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
  loggedAt: string
  portionUnit?: PortionUnit | null
  portionQuantity?: number | null
  referenceWeightGrams?: number | null
}

export type NewFoodEntry = Omit<FoodEntry, 'id' | 'loggedAt' | 'portionUnit' | 'portionQuantity' | 'referenceWeightGrams'> & {
  portionUnit?: PortionUnit | null
  portionQuantity?: number | null
  referenceWeightGrams?: number | null
}
export type FoodEntryWrite = NewFoodEntry & {
  loggedAt?: string
  /** Helper text for barcode/manual prefill; not persisted. */
  nutritionBasisNote?: string
}
export type UpdateFoodEntry = Partial<NewFoodEntry> & { loggedAt?: string }

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

export interface ActivityExercise {
  id: string
  workoutExerciseId: string | null
  name: string
  sortOrder: number
  repsCompleted: number
}

export interface Activity {
  id: string
  name: string
  activityType: string
  activityDate: string
  loggedAt: string
  distanceMeters: number | null
  movingTimeSeconds: number
  averageHeartrate: number | null
  maxHeartrate: number | null
  calories: number | null
  workoutId: string | null
  workoutSetsLogged: number | null
  exercises: ActivityExercise[]
}

export type NewActivity = Omit<
  Activity,
  'id' | 'activityDate' | 'loggedAt' | 'workoutId' | 'workoutSetsLogged' | 'exercises'
>
export type ActivityWrite = NewActivity & { loggedAt?: string }
export type UpdateActivity = Partial<NewActivity> & { loggedAt?: string }

export type ActivityTotals = {
  calories: number
  movingTimeSeconds: number
  distanceMeters: number
}
