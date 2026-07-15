import type { Totals } from './types.js'

export interface RecipeMacroLine {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  caffeine: number
}

const ZERO: Totals = { calories: 0, protein: 0, carbs: 0, caffeine: 0, fat: 0, fiber: 0 }

export function sumRecipeIngredients(ingredients: readonly RecipeMacroLine[]): Totals {
  return ingredients.reduce<Totals>(
    (acc, line) => ({
      calories: acc.calories + line.calories,
      protein: acc.protein + line.protein,
      carbs: acc.carbs + line.carbs,
      caffeine: acc.caffeine + line.caffeine,
      fat: acc.fat + line.fat,
      fiber: acc.fiber + line.fiber,
    }),
    ZERO,
  )
}

export function perServingTotals(batchTotals: Totals, defaultServings: number): Totals {
  if (defaultServings <= 0) {
    throw new Error('defaultServings must be greater than 0')
  }
  return {
    calories: Math.round(batchTotals.calories / defaultServings),
    protein: Math.round(batchTotals.protein / defaultServings),
    carbs: Math.round(batchTotals.carbs / defaultServings),
    caffeine: Math.round(batchTotals.caffeine / defaultServings),
    fat: Math.round(batchTotals.fat / defaultServings),
    fiber: Math.round(batchTotals.fiber / defaultServings),
  }
}

export function validateServingsLogged(value: unknown): number {
  const servings =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number.parseFloat(value)
        : NaN
  if (!Number.isFinite(servings) || servings <= 0) {
    throw new Error('servings must be greater than 0')
  }
  return servings
}

/**
 * Scale batch (full-recipe) macros to a number of servings logged.
 * Uses a single round after multiplying so logging the full batch
 * (servingsLogged === defaultServings) conserves batch totals.
 * Do not route through perServingTotals — intermediate rounding loses kcal.
 */
export function scaleRecipeToServings(
  batchTotals: Totals,
  defaultServings: number,
  servingsLogged: number,
): Totals {
  if (defaultServings <= 0) {
    throw new Error('defaultServings must be greater than 0')
  }
  if (servingsLogged <= 0) {
    throw new Error('servingsLogged must be greater than 0')
  }
  const factor = servingsLogged / defaultServings
  return {
    calories: Math.round(batchTotals.calories * factor),
    protein: Math.round(batchTotals.protein * factor),
    carbs: Math.round(batchTotals.carbs * factor),
    caffeine: Math.round(batchTotals.caffeine * factor),
    fat: Math.round(batchTotals.fat * factor),
    fiber: Math.round(batchTotals.fiber * factor),
  }
}
