import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NUTRITION_GOALS,
  parseNutritionGoals,
  validateNutritionGoals,
} from '../goals.js'

describe('parseNutritionGoals', () => {
  it('returns defaults for invalid input', () => {
    expect(parseNutritionGoals(null)).toEqual(DEFAULT_NUTRITION_GOALS)
  })

  it('merges partial overrides', () => {
    expect(parseNutritionGoals({ protein: { value: 180, low: 150, high: 200 } }).protein).toEqual({
      value: 180,
      low: 150,
      high: 200,
    })
  })
})

describe('validateNutritionGoals', () => {
  it('accepts default goals', () => {
    expect(validateNutritionGoals(DEFAULT_NUTRITION_GOALS).ok).toBe(true)
  })

  it('rejects when target exceeds high', () => {
    const invalid = {
      ...DEFAULT_NUTRITION_GOALS,
      carbs: { value: 400, low: 200, high: 300 },
    }
    expect(validateNutritionGoals(invalid).ok).toBe(false)
  })
})