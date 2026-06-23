import { describe, expect, it } from 'vitest'
import { sumTotals } from '../sumTotals.js'
import type { FoodEntry } from '../types.js'

function makeEntry(overrides: Partial<FoodEntry> = {}): FoodEntry {
  return {
    id: 'e1',
    icon: 'fa-coffee',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    name: 'x',
    description: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    caffeine: 0,
    fat: 0,
    fiber: 0,
    ...overrides,
  }
}

describe('sumTotals', () => {
  it('returns all zeros for an empty list', () => {
    expect(sumTotals([])).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      caffeine: 0,
      fat: 0,
      fiber: 0,
    })
  })

  it('returns the values of a single entry', () => {
    expect(sumTotals([makeEntry({ calories: 100, protein: 10, carbs: 20, caffeine: 50 })])).toEqual(
      { calories: 100, protein: 10, carbs: 20, caffeine: 50, fat: 0, fiber: 0 },
    )
  })

  it('sums all macro fields across multiple entries', () => {
    const entries = [
      makeEntry({ calories: 100, protein: 10, carbs: 20, caffeine: 50 }),
      makeEntry({ calories: 250, protein: 25, carbs: 40, caffeine: 0 }),
      makeEntry({ calories: 75, protein: 5, carbs: 15, caffeine: 100 }),
    ]
    expect(sumTotals(entries)).toEqual({
      calories: 425,
      protein: 40,
      carbs: 75,
      caffeine: 150,
      fat: 0,
      fiber: 0,
    })
  })

  it('does not mutate the input array', () => {
    const entries = [makeEntry({ calories: 100 }), makeEntry({ calories: 200 })]
    const snapshot = entries.map((e) => e.calories)
    sumTotals(entries)
    expect(entries.map((e) => e.calories)).toEqual(snapshot)
  })

  it('treats missing fields as zero (via the entry default)', () => {
    const partial: FoodEntry = {
      ...makeEntry(),
      calories: 100,
      protein: 10,
    }
    expect(sumTotals([partial])).toEqual({
      calories: 100,
      protein: 10,
      carbs: 0,
      caffeine: 0,
      fat: 0,
      fiber: 0,
    })
  })
})
