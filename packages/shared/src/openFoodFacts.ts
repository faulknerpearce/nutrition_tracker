import { DEFAULT_ICON_BG, DEFAULT_ICON_COLOR } from './icons.js'
import type { NewFoodEntry } from './types.js'

export interface OpenFoodFactsNutriments {
  [key: string]: number | string | undefined
}

export interface OpenFoodFactsProduct {
  product_name?: string
  brands?: string
  nutriments?: OpenFoodFactsNutriments
  serving_size?: string
  serving_quantity?: number | string
  quantity?: string
}

export interface MappedBarcodeProduct {
  entry: NewFoodEntry
  servingNote: string
  referenceWeightGrams: number
  hasCompleteNutrition: boolean
}

function parseNumeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/,/g, '.'))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function parseServingGrams(product: OpenFoodFactsProduct): number | null {
  const fromQuantity = parseNumeric(product.serving_quantity)
  if (fromQuantity !== null && fromQuantity > 0) return fromQuantity

  if (typeof product.serving_size === 'string') {
    const match = product.serving_size.match(/([\d.]+)\s*g/i)
    if (match) {
      const grams = Number.parseFloat(match[1])
      if (Number.isFinite(grams) && grams > 0) return grams
    }
  }

  return null
}

function nutrient(
  nutriments: OpenFoodFactsNutriments,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const value = parseNumeric(nutriments[key])
    if (value !== null) return value
  }
  return null
}

function scalePer100g(value: number, grams: number): number {
  return Math.round(value * (grams / 100) * 10) / 10
}

function roundMacro(value: number): number {
  return Math.round(value * 10) / 10
}

export function mapOpenFoodFactsToEntry(
  product: OpenFoodFactsProduct,
  _barcode: string,
): MappedBarcodeProduct {
  const nutriments = product.nutriments ?? {}
  const name = (product.product_name ?? 'Scanned product').trim()
  const servingGrams = parseServingGrams(product)

  const perServing = {
    calories: nutrient(nutriments, ['energy-kcal_serving', 'energy_serving']),
    protein: nutrient(nutriments, ['proteins_serving', 'protein_serving']),
    carbs: nutrient(nutriments, ['carbohydrates_serving', 'carbohydrate_serving']),
    fat: nutrient(nutriments, ['fat_serving']),
    fiber: nutrient(nutriments, ['fiber_serving']),
    caffeine: nutrient(nutriments, ['caffeine_serving']),
  }

  const per100g = {
    calories: nutrient(nutriments, ['energy-kcal_100g', 'energy-kcal', 'energy_100g', 'energy']),
    protein: nutrient(nutriments, ['proteins_100g', 'proteins', 'protein_100g', 'protein']),
    carbs: nutrient(nutriments, [
      'carbohydrates_100g',
      'carbohydrates',
      'carbohydrate_100g',
      'carbohydrate',
    ]),
    fat: nutrient(nutriments, ['fat_100g', 'fat']),
    fiber: nutrient(nutriments, ['fiber_100g', 'fiber']),
    caffeine: nutrient(nutriments, ['caffeine_100g', 'caffeine']),
  }

  let servingNote = 'Values per 100g — adjust if needed'
  let macros = { ...per100g }

  if (perServing.calories !== null) {
    servingNote =
      product.serving_size?.trim() ||
      (servingGrams ? `Per serving (${servingGrams}g)` : 'Per serving')
    macros = { ...perServing }
  } else if (servingGrams !== null && per100g.calories !== null) {
    servingNote = `Per serving (${servingGrams}g)`
    macros = {
      calories:
        per100g.calories !== null ? scalePer100g(per100g.calories, servingGrams) : null,
      protein:
        per100g.protein !== null ? scalePer100g(per100g.protein, servingGrams) : null,
      carbs: per100g.carbs !== null ? scalePer100g(per100g.carbs, servingGrams) : null,
      fat: per100g.fat !== null ? scalePer100g(per100g.fat, servingGrams) : null,
      fiber: per100g.fiber !== null ? scalePer100g(per100g.fiber, servingGrams) : null,
      caffeine:
        per100g.caffeine !== null ? scalePer100g(per100g.caffeine, servingGrams) : null,
    }
  }

  const entry: NewFoodEntry = {
    name: name || 'Scanned product',
    description: '',
    calories: roundMacro(macros.calories ?? 0),
    protein: roundMacro(macros.protein ?? 0),
    carbs: roundMacro(macros.carbs ?? 0),
    fat: roundMacro(macros.fat ?? 0),
    fiber: roundMacro(macros.fiber ?? 0),
    caffeine: roundMacro(macros.caffeine ?? 0),
    icon: 'fa-bowl-food',
    iconBg: DEFAULT_ICON_BG,
    iconColor: DEFAULT_ICON_COLOR,
  }

  const hasCompleteNutrition =
    entry.calories > 0 && entry.protein >= 0 && entry.carbs >= 0 && entry.fat >= 0

  const referenceWeightGrams = servingGrams ?? 100

  return { entry, servingNote, referenceWeightGrams, hasCompleteNutrition }
}