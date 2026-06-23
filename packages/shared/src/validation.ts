export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string }

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function isNonNegativeNumber(v: unknown): v is number {
  return isFiniteNumber(v) && v >= 0
}

export interface EntryInput {
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  caffeine: number
}

export function validateEntry(input: Partial<EntryInput>): ValidationResult<EntryInput> {
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    return { ok: false, error: 'name is required' }
  }
  if (!isNonNegativeNumber(input.calories)) {
    return { ok: false, error: 'calories is required and must be a non-negative number' }
  }
  if (!isNonNegativeNumber(input.protein)) {
    return { ok: false, error: 'protein is required and must be a non-negative number' }
  }
  if (input.carbs !== undefined && !isNonNegativeNumber(input.carbs)) {
    return { ok: false, error: 'carbs must be a non-negative number' }
  }
  if (input.caffeine !== undefined && !isNonNegativeNumber(input.caffeine)) {
    return { ok: false, error: 'caffeine must be a non-negative number' }
  }
  return {
    ok: true,
    value: {
      name: input.name.trim(),
      description: typeof input.description === 'string' ? input.description : '',
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs ?? 0,
      caffeine: input.caffeine ?? 0,
    },
  }
}
