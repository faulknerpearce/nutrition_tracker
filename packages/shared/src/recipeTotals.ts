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

export function scaleRecipeToServings(
  batchTotals: Totals,
  defaultServings: number,
  servingsLogged: number,
): Totals {
  if (servingsLogged <= 0) {
    throw new Error('servingsLogged must be greater than 0')
  }
  const perServing = perServingTotals(batchTotals, defaultServings)
  return {
    calories: Math.round(perServing.calories * servingsLogged),
    protein: Math.round(perServing.protein * servingsLogged),
    carbs: Math.round(perServing.carbs * servingsLogged),
    caffeine: Math.round(perServing.caffeine * servingsLogged),
    fat: Math.round(perServing.fat * servingsLogged),
    fiber: Math.round(perServing.fiber * servingsLogged),
  }
}