import { createContext } from 'react'
import type { NutritionGoals } from '../lib/goals'

export interface GoalsContextValue {
  goals: NutritionGoals
  loading: boolean
  updateGoals: (goals: NutritionGoals) => Promise<{ error: string | null }>
}

export const GoalsContext = createContext<GoalsContextValue | null>(null)