import { describe, expect, it } from 'vitest'
import {
  computeMifflinStJeorBmr,
  DEFAULT_PROFILE_GENDER,
  resolveBmr,
} from '../bmr.js'

describe('computeMifflinStJeorBmr', () => {
  it('uses the female formula by default gender', () => {
    expect(
      computeMifflinStJeorBmr({
        weightKg: 65,
        heightCm: 165,
        age: 30,
        gender: DEFAULT_PROFILE_GENDER,
      }),
    ).toBe(1370)
  })

  it('uses the male formula', () => {
    expect(
      computeMifflinStJeorBmr({
        weightKg: 80,
        heightCm: 180,
        age: 35,
        gender: 'male',
      }),
    ).toBe(1755)
  })
})

describe('resolveBmr', () => {
  it('prefers manual override when set', () => {
    const result = resolveBmr({
      age: 30,
      heightCm: 165,
      weightKg: 65,
      gender: 'female',
      bmrOverride: 1500,
    })
    expect(result.bmr).toBe(1500)
    expect(result.source).toBe('override')
    expect(result.calculatedBmr).toBe(1370)
  })

  it('falls back when body stats are incomplete', () => {
    const result = resolveBmr({
      age: null,
      heightCm: null,
      weightKg: null,
      gender: 'female',
      bmrOverride: null,
    })
    expect(result.bmr).toBeGreaterThan(0)
    expect(result.source).toBe('fallback')
  })
})