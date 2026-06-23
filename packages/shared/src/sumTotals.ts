import type { FoodEntry, Totals } from './types.js'

const ZERO: Totals = { calories: 0, protein: 0, carbs: 0, caffeine: 0 }

export function sumTotals(entries: readonly FoodEntry[]): Totals {
  return entries.reduce<Totals>(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      caffeine: acc.caffeine + e.caffeine,
    }),
    ZERO,
  )
}
