import {
  DEFAULT_NUTRITION_GOALS,
  validateNutritionGoals,
  type NutritionGoals,
} from '@nutrition-tracker/shared'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchUserGoals, saveUserGoals } from '../lib/goals'
import { useAuth } from './useAuth'
import { GoalsContext } from './goals-context'

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user!.id
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_NUTRITION_GOALS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchUserGoals(userId)
      .then((nextGoals) => {
        if (!cancelled) setGoals(nextGoals)
      })
      .catch(() => {
        if (!cancelled) setGoals(DEFAULT_NUTRITION_GOALS)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const updateGoals = useCallback(
    async (nextGoals: NutritionGoals) => {
      const validated = validateNutritionGoals(nextGoals)
      if (!validated.ok) return { error: validated.error }

      try {
        const saved = await saveUserGoals(userId, validated.value)
        setGoals(saved)
        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to save goals' }
      }
    },
    [userId],
  )

  const value = useMemo(
    () => ({ goals, loading, updateGoals }),
    [goals, loading, updateGoals],
  )

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>
}