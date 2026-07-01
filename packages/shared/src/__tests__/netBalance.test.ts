import { describe, expect, it } from 'vitest'
import { computeNetBalance } from '../netBalance.js'

describe('computeNetBalance', () => {
  const low = 2800
  const high = 3200
  const bmr = 1400

  it('computes net calories as consumed minus BMR and activity', () => {
    const balance = computeNetBalance(2400, 520, low, high, bmr)
    expect(balance.net).toBe(480)
    expect(balance.consumed).toBe(2400)
    expect(balance.bmr).toBe(1400)
    expect(balance.activityCalories).toBe(520)
    expect(balance.burned).toBe(1920)
  })

  it('reports under target when net is below low', () => {
    const balance = computeNetBalance(2000, 0, low, high, bmr)
    expect(balance.status).toBe('under')
    expect(balance.remainingToLow).toBe(2200)
    expect(balance.burned).toBe(1400)
  })

  it('reports in range when net is between low and high', () => {
    const balance = computeNetBalance(4400, 0, low, high, bmr)
    expect(balance.status).toBe('in_range')
    expect(balance.contextMessage).toMatch(/Within/)
  })

  it('reports over target when net exceeds high', () => {
    const balance = computeNetBalance(5000, 0, low, high, bmr)
    expect(balance.status).toBe('over')
    expect(balance.overHighBy).toBe(400)
    expect(balance.contextMessage).toMatch(/400/)
  })

  it('always includes BMR in burned output', () => {
    const balance = computeNetBalance(1500, 0, low, high, bmr)
    expect(balance.burned).toBe(1400)
    expect(balance.net).toBe(100)
  })
})