import { describe, expect, it } from 'vitest'
import type { RecipeSummary } from '@nutrition-tracker/shared'
import { filterAndSortRecipes, recipeMatchesQuery } from '../lib/recipeFilters'

const emptyTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  caffeine: 0,
}

function recipe(
  partial: Partial<RecipeSummary> & Pick<RecipeSummary, 'id' | 'name'>,
): RecipeSummary {
  return {
    description: '',
    icon: 'fa-utensils',
    iconBg: '#f4f4f5',
    iconColor: '#71717a',
    defaultServings: 1,
    servingWeightGrams: null,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    batchTotals: emptyTotals,
    perServingTotals: emptyTotals,
    ingredientCount: 1,
    ...partial,
  }
}

describe('recipeMatchesQuery', () => {
  it('matches recipe name and description', () => {
    const item = recipe({ id: '1', name: 'Overnight Oats', description: 'High fiber breakfast' })
    expect(recipeMatchesQuery(item, 'oats')).toBe(true)
    expect(recipeMatchesQuery(item, 'fiber')).toBe(true)
    expect(recipeMatchesQuery(item, 'pizza')).toBe(false)
  })
})

describe('filterAndSortRecipes', () => {
  const items = [
    recipe({
      id: '1',
      name: 'Beta Bowl',
      updatedAt: '2026-06-02T00:00:00Z',
      perServingTotals: { ...emptyTotals, calories: 500 },
      ingredientCount: 4,
    }),
    recipe({
      id: '2',
      name: 'Alpha Salad',
      updatedAt: '2026-06-03T00:00:00Z',
      perServingTotals: { ...emptyTotals, calories: 300 },
      ingredientCount: 6,
    }),
    recipe({
      id: '3',
      name: 'Gamma Shake',
      updatedAt: '2026-06-01T00:00:00Z',
      perServingTotals: { ...emptyTotals, calories: 700 },
      ingredientCount: 2,
    }),
  ]

  it('sorts by calories descending', () => {
    const result = filterAndSortRecipes(items, '', 'calories-desc')
    expect(result.map((item) => item.perServingTotals.calories)).toEqual([700, 500, 300])
  })

  it('sorts by ingredient count ascending', () => {
    const result = filterAndSortRecipes(items, '', 'ingredients-asc')
    expect(result.map((item) => item.ingredientCount)).toEqual([2, 4, 6])
  })
})
