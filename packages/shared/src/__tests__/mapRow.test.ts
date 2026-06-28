import { describe, expect, it } from 'vitest'
import { mapRow } from '../mapRow.js'
import type { FoodRow } from '../types.js'

function makeRow(overrides: Partial<FoodRow> = {}): FoodRow {
  return {
    id: 'row-1',
    icon: 'fa-coffee',
    icon_bg: '#fef3c7',
    icon_color: '#d97706',
    name: 'Small Flat White',
    description: 'Double shot',
    calories: 120,
    protein: 7,
    carbs: 9,
    caffeine: 130,
    fat: 4,
    fiber: 1,
    user_id: 'user-1',
    created_at: '2026-06-22T08:00:00Z',
    entry_date: '2026-06-22',
    recipe_id: null,
    servings_logged: null,
    portion_unit: null,
    portion_quantity: null,
    reference_weight_grams: null,
    ...overrides,
  }
}

describe('mapRow', () => {
  it('renames snake_case keys to camelCase', () => {
    const result = mapRow(makeRow())
    expect(result.iconBg).toBe('#fef3c7')
    expect(result.iconColor).toBe('#d97706')
    expect(result).not.toHaveProperty('icon_bg')
    expect(result).not.toHaveProperty('icon_color')
  })

  it('preserves all scalar values', () => {
    const result = mapRow(makeRow())
    expect(result).toEqual({
      id: 'row-1',
      icon: 'fa-coffee',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      name: 'Small Flat White',
      description: 'Double shot',
      calories: 120,
      protein: 7,
      carbs: 9,
      caffeine: 130,
      fat: 4,
      fiber: 1,
      loggedAt: '2026-06-22T08:00:00Z',
      portionUnit: null,
      portionQuantity: null,
      referenceWeightGrams: null,
    })
  })

  it('maps created_at to loggedAt', () => {
    const result = mapRow(makeRow({ created_at: '2026-06-22T15:30:00Z' }))
    expect(result.loggedAt).toBe('2026-06-22T15:30:00Z')
    expect(result).not.toHaveProperty('created_at')
    expect(result).not.toHaveProperty('entry_date')
  })

  it('passes through zeros', () => {
    const result = mapRow(
      makeRow({
        calories: 0,
        protein: 0,
        carbs: 0,
        caffeine: 0,
      }),
    )
    expect(result.calories).toBe(0)
    expect(result.protein).toBe(0)
    expect(result.carbs).toBe(0)
    expect(result.caffeine).toBe(0)
  })
})
