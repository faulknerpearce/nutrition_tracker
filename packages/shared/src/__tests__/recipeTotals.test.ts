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
  it('divides batch totals by default servings', () => {
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
  it('scales per-serving totals by servings logged', () => {
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

  it('rejects invalid servings', () => {
    expect(() =>
      scaleRecipeToServings(
        { calories: 100, protein: 10, carbs: 0, fat: 0, fiber: 0, caffeine: 0 },
        1,
        0,
      ),
    ).toThrow('servingsLogged must be greater than 0')
  })
})