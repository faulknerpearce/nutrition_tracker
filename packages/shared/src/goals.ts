export interface Goal {
  value: number
  low: number
  high: number
}

export const goals = {
  calories: { value: 3000, low: 2800, high: 3200 } satisfies Goal,
  protein: { value: 150, low: 120, high: 170 } satisfies Goal,
  carbs: { value: 250, low: 200, high: 300 } satisfies Goal,
  caffeine: { value: 400, low: 0, high: 400 } satisfies Goal,
}

export const calGoal = goals.calories.value
export const proGoal = goals.protein.value
export const carbGoal = goals.carbs.value
export const caffeineGoal = goals.caffeine.value
