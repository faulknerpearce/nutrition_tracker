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
  }
}
