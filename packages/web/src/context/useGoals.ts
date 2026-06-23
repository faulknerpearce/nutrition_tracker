import { useContext } from 'react'
import { DEFAULT_NUTRITION_GOALS } from '@nutrition-tracker/shared'
import { GoalsContext } from './goals-context'

export function useGoals() {
  const context = useContext(GoalsContext)
  if (!context) {
    throw new Error('useGoals must be used within GoalsProvider')
  }
  return context
}

export function useGoalsOptional() {
  return useContext(GoalsContext)
}

export function useNutritionGoals() {
  return useGoalsOptional()?.goals ?? DEFAULT_NUTRITION_GOALS
}