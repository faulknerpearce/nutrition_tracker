import { describe, expect, it } from 'vitest'
import { DEFAULT_TIMEZONE } from '../dateUtils.js'
import { DEFAULT_NUTRITION_GOALS } from '../goals.js'
import {
  mapProfileRow,
  validateBodyStats,
  validateProfileUpdate,
} from '../profile.js'

describe('mapProfileRow', () => {
  it('maps snake_case profile fields', () => {
    expect(
      mapProfileRow({
        display_name: 'Alex',
        nutrition_goals: DEFAULT_NUTRITION_GOALS,
        age: 32,
        height_cm: 180,
        weight_kg: 78.5,
      }),
    ).toEqual({
      displayName: 'Alex',
      nutritionGoals: DEFAULT_NUTRITION_GOALS,
      age: 32,
      heightCm: 180,
      weightKg: 78.5,
      gender: 'female',
      bmrOverride: null,
      timeZone: DEFAULT_TIMEZONE,
    })
  })
})

describe('validateBodyStats', () => {
  it('accepts empty stats', () => {
    expect(validateBodyStats({ age: null, heightCm: null, weightKg: null }).ok).toBe(true)
  })

  it('rejects invalid age', () => {
    expect(validateBodyStats({ age: 10, heightCm: null, weightKg: null }).ok).toBe(false)
  })
})

describe('validateProfileUpdate', () => {
  it('accepts a display name update', () => {
    expect(validateProfileUpdate({ displayName: 'Alex' }).ok).toBe(true)
  })

  it('rejects blank display name', () => {
    expect(validateProfileUpdate({ displayName: '   ' }).ok).toBe(false)
  })
})