import { describe, expect, it } from 'vitest'
import { perServingTotals, scaleRecipeToServings, sumRecipeIngredients } from '../recipeTotals.js'

describe('sumRecipeIngredients', () => {
  it('sums macro lines into batch totals', () => {
    expect(
      sumRecipeIngredients([
        { calories: 300, protein: 25, carbs: 10, fat: 8, fiber: 2, caffeine: 0 },
        { calories: 200, protein: 15, carbs: 20, fat: 5, fiber: 3, caffeine: 50 },
      ]),
    ).toEqual({
      calories: 500,
      protein: 40,
      carbs: 30,
      fat: 13,
      fiber: 5,
      caffeine: 50,
    })
  })
})

describe('perServingTotals', () => {
  it('divides batch totals by default servings (display rounding only)', () => {
    expect(
      perServingTotals(
        { calories: 1200, protein: 80, carbs: 100, fat: 40, fiber: 20, caffeine: 0 },
        4,
      ),
    ).toEqual({
      calories: 300,
      protein: 20,
      carbs: 25,
      fat: 10,
      fiber: 5,
      caffeine: 0,
    })
  })
})

describe('scaleRecipeToServings', () => {
  it('scales batch totals by servings logged with a single round', () => {
    expect(
      scaleRecipeToServings(
        { calories: 1200, protein: 80, carbs: 100, fat: 40, fiber: 20, caffeine: 0 },
        4,
        1.5,
      ),
    ).toEqual({
      calories: 450,
      protein: 30,
      carbs: 38,
      fat: 15,
      fiber: 8,
      caffeine: 0,
    })
  })

  it('conserves batch totals when logging the full batch', () => {
    const batch = { calories: 1000, protein: 100, carbs: 90, fat: 40, fiber: 12, caffeine: 30 }
    expect(scaleRecipeToServings(batch, 3, 3)).toEqual(batch)
  })

  it('does not undercount when intermediate per-serving rounding would lose kcal', () => {
    // Double-round path: round(1000/3)=333, round(333*2)=666, round(333*3)=999
    // Single-round: round(1000*2/3)=667, round(1000*3/3)=1000
    const batch = { calories: 1000, protein: 100, carbs: 0, fat: 0, fiber: 0, caffeine: 0 }
    expect(scaleRecipeToServings(batch, 3, 2)).toEqual({
      calories: 667,
      protein: 67,
      carbs: 0,
      fat: 0,
      fiber: 0,
      caffeine: 0,
    })
    expect(scaleRecipeToServings(batch, 3, 3)).toEqual(batch)
  })

  it('supports fractional servings (e.g. grams converted to effective servings)', () => {
    // 250g of a 250g serving on a 4-serving batch of 1200 kcal → 1 serving → 300 kcal
    const batch = { calories: 1200, protein: 80, carbs: 100, fat: 40, fiber: 20, caffeine: 0 }
    const effectiveServings = 250 / 250
    expect(scaleRecipeToServings(batch, 4, effectiveServings)).toEqual({
      calories: 300,
      protein: 20,
      carbs: 25,
      fat: 10,
      fiber: 5,
      caffeine: 0,
    })
    // 500g → 2 servings
    expect(scaleRecipeToServings(batch, 4, 500 / 250)).toEqual({
      calories: 600,
      protein: 40,
      carbs: 50,
      fat: 20,
      fiber: 10,
      caffeine: 0,
    })
  })

  it('rejects invalid servings', () => {
    expect(() =>
      scaleRecipeToServings(
        { calories: 100, protein: 10, carbs: 0, fat: 0, fiber: 0, caffeine: 0 },
        1,
        0,
      ),
    ).toThrow('servingsLogged must be greater than 0')
  })

  it('rejects invalid defaultServings', () => {
    expect(() =>
      scaleRecipeToServings(
        { calories: 100, protein: 10, carbs: 0, fat: 0, fiber: 0, caffeine: 0 },
        0,
        1,
      ),
    ).toThrow('defaultServings must be greater than 0')
  })
})
