import { describe, expect, it } from 'vitest'
import { mapOpenFoodFactsToEntry } from '../openFoodFacts.js'

describe('mapOpenFoodFactsToEntry', () => {
  it('maps per-serving nutriments when available', () => {
    const result = mapOpenFoodFactsToEntry(
      {
        product_name: '  Protein Bar  ',
        brands: 'Acme Foods',
        serving_size: '60 g',
        nutriments: {
          'energy-kcal_serving': 220,
          proteins_serving: 20,
          carbohydrates_serving: 25,
          fat_serving: 8,
          fiber_serving: 3,
        },
      },
      '012345678905',
    )

    expect(result.entry.name).toBe('Protein Bar')
    expect(result.entry.calories).toBe(220)
    expect(result.entry.protein).toBe(20)
    expect(result.entry.carbs).toBe(25)
    expect(result.entry.fat).toBe(8)
    expect(result.entry.fiber).toBe(3)
    expect(result.entry.description).toContain('Acme Foods')
    expect(result.entry.description).toContain('012345678905')
    expect(result.hasCompleteNutrition).toBe(true)
  })

  it('scales per-100g values using serving quantity', () => {
    const result = mapOpenFoodFactsToEntry(
      {
        product_name: 'Greek Yogurt',
        serving_quantity: 150,
        nutriments: {
          'energy-kcal_100g': 100,
          proteins_100g: 10,
          carbohydrates_100g: 4,
          fat_100g: 5,
        },
      },
      '12345678',
    )

    expect(result.entry.calories).toBe(150)
    expect(result.entry.protein).toBe(15)
    expect(result.entry.carbs).toBe(6)
    expect(result.entry.fat).toBe(7.5)
    expect(result.servingNote).toBe('Per serving (150g)')
  })

  it('falls back to per-100g values when serving data is missing', () => {
    const result = mapOpenFoodFactsToEntry(
      {
        product_name: 'Oats',
        nutriments: {
          'energy-kcal_100g': 389,
          proteins_100g: 17,
          carbohydrates_100g: 66,
          fat_100g: 7,
        },
      },
      '999',
    )

    expect(result.entry.calories).toBe(389)
    expect(result.servingNote).toBe('Values per 100g — adjust if needed')
  })
})