import type { ValidationResult } from './validation.js'

export interface GoalRange {
  value: number
  low: number
  high: number
}

export interface NutritionGoals {
  calories: GoalRange
  protein: GoalRange
  carbs: GoalRange
  caffeine: GoalRange
  fat: GoalRange
  fiber: GoalRange
}

/** @deprecated Use NutritionGoals */
export type Goal = GoalRange

export const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  calories: { value: 3000, low: 2800, high: 3200 },
  protein: { value: 150, low: 120, high: 170 },
  carbs: { value: 250, low: 200, high: 300 },
  caffeine: { value: 400, low: 0, high: 400 },
  fat: { value: 65, low: 50, high: 80 },
  fiber: { value: 30, low: 25, high: 35 },
}

/** @deprecated Use DEFAULT_NUTRITION_GOALS */
export const goals = DEFAULT_NUTRITION_GOALS

export const calGoal = DEFAULT_NUTRITION_GOALS.calories.value
export const proGoal = DEFAULT_NUTRITION_GOALS.protein.value
export const carbGoal = DEFAULT_NUTRITION_GOALS.carbs.value
export const caffeineGoal = DEFAULT_NUTRITION_GOALS.caffeine.value
export const fatGoal = DEFAULT_NUTRITION_GOALS.fat.value
export const fiberGoal = DEFAULT_NUTRITION_GOALS.fiber.value

const GOAL_KEYS = ['calories', 'protein', 'carbs', 'caffeine', 'fat', 'fiber'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseGoalRange(raw: unknown, fallback: GoalRange): GoalRange {
  if (!isRecord(raw)) return fallback
  const value = typeof raw.value === 'number' && Number.isFinite(raw.value) ? raw.value : fallback.value
  const low = typeof raw.low === 'number' && Number.isFinite(raw.low) ? raw.low : fallback.low
  const high = typeof raw.high === 'number' && Number.isFinite(raw.high) ? raw.high : fallback.high
  return { value, low, high }
}

export function parseNutritionGoals(raw: unknown): NutritionGoals {
  if (!isRecord(raw)) return DEFAULT_NUTRITION_GOALS

  const parsed = { ...DEFAULT_NUTRITION_GOALS }
  for (const key of GOAL_KEYS) {
    parsed[key] = parseGoalRange(raw[key], DEFAULT_NUTRITION_GOALS[key])
  }
  return parsed
}

function isPositiveInt(n: number): boolean {
  return Number.isFinite(n) && n > 0 && Number.isInteger(n)
}

function isNonNegativeInt(n: number): boolean {
  return Number.isFinite(n) && n >= 0 && Number.isInteger(n)
}

export function validateNutritionGoals(input: NutritionGoals): ValidationResult<NutritionGoals> {
  for (const key of GOAL_KEYS) {
    const goal = input[key]
    if (!isPositiveInt(goal.value)) {
      return { ok: false, error: `${key} target must be a positive whole number` }
    }
    if (!isNonNegativeInt(goal.low) || !isPositiveInt(goal.high)) {
      return { ok: false, error: `${key} low and high must be whole numbers` }
    }
    if (goal.low > goal.value) {
      return { ok: false, error: `${key} low cannot exceed the target` }
    }
    if (goal.value > goal.high) {
      return { ok: false, error: `${key} target cannot exceed high` }
    }
    if (key === 'caffeine' && goal.low !== 0) {
      return { ok: false, error: 'caffeine low must be 0' }
    }
  }

  return { ok: true, value: input }
}