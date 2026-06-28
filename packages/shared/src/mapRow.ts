import type { FoodEntry, FoodRow } from './types.js'

export function mapRow(row: FoodRow): FoodEntry {
  return {
    id: row.id,
    icon: row.icon,
    iconBg: row.icon_bg,
    iconColor: row.icon_color,
    name: row.name,
    description: row.description,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    caffeine: row.caffeine,
    fat: row.fat ?? 0,
    fiber: row.fiber ?? 0,
    loggedAt: row.created_at,
    portionUnit:
      row.portion_unit === 'servings' || row.portion_unit === 'grams' ? row.portion_unit : null,
    portionQuantity:
      row.portion_quantity === null || row.portion_quantity === undefined
        ? null
        : Number(row.portion_quantity),
    referenceWeightGrams:
      row.reference_weight_grams === null || row.reference_weight_grams === undefined
        ? null
        : Number(row.reference_weight_grams),
  }
}
