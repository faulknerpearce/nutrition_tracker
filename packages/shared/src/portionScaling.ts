import type { Totals } from './types.js'
import type { ValidationResult } from './validation.js'

export type PortionUnit = 'servings' | 'grams'

export interface PortionInput {
  portionUnit: PortionUnit
  portionQuantity: number
  referenceWeightGrams: number
}

export interface PortionMeta {
  portionUnit?: PortionUnit | null
  portionQuantity?: number | null
  referenceWeightGrams?: number | null
}

function parsePositiveNumber(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number.parseFloat(value)
        : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN
}

export function portionScaleFactor(input: PortionInput): number {
  if (input.portionUnit === 'servings') {
    return input.portionQuantity
  }
  return input.portionQuantity / input.referenceWeightGrams
}

export function scaleMacrosByPortion(base: Totals, input: PortionInput): Totals {
  const factor = portionScaleFactor(input)
  return {
    calories: Math.round(base.calories * factor),
    protein: Math.round(base.protein * factor),
    carbs: Math.round(base.carbs * factor),
    caffeine: Math.round(base.caffeine * factor),
    fat: Math.round(base.fat * factor),
    fiber: Math.round(base.fiber * factor),
  }
}

export function validatePortionInput(input: {
  portionUnit?: unknown
  portionQuantity?: unknown
  referenceWeightGrams?: unknown
}): ValidationResult<PortionInput> {
  const portionUnit = input.portionUnit
  if (portionUnit !== 'servings' && portionUnit !== 'grams') {
    return { ok: false, error: 'portionUnit must be servings or grams' }
  }

  const portionQuantity = parsePositiveNumber(input.portionQuantity)
  if (!Number.isFinite(portionQuantity)) {
    return { ok: false, error: 'portionQuantity must be greater than 0' }
  }

  const referenceWeightGrams = parsePositiveNumber(input.referenceWeightGrams)
  if (!Number.isFinite(referenceWeightGrams)) {
    return { ok: false, error: 'referenceWeightGrams must be greater than 0' }
  }

  return {
    ok: true,
    value: { portionUnit, portionQuantity, referenceWeightGrams },
  }
}

export function parsePortionMeta(input: Record<string, unknown>): PortionInput | null {
  const portionUnit = input.portionUnit ?? input.portion_unit
  if (portionUnit !== 'servings' && portionUnit !== 'grams') {
    return null
  }

  const portionQuantity = parsePositiveNumber(input.portionQuantity ?? input.portion_quantity)
  const referenceWeightGrams = parsePositiveNumber(
    input.referenceWeightGrams ?? input.reference_weight_grams,
  )

  if (!Number.isFinite(portionQuantity) || !Number.isFinite(referenceWeightGrams)) {
    return null
  }

  return { portionUnit, portionQuantity, referenceWeightGrams }
}

export function buildPortionPayload(meta: PortionInput): {
  portion_unit: PortionUnit
  portion_quantity: number
  reference_weight_grams: number
} {
  return {
    portion_unit: meta.portionUnit,
    portion_quantity: meta.portionQuantity,
    reference_weight_grams: meta.referenceWeightGrams,
  }
}

export function formatPortionLabel(meta: PortionMeta): string | null {
  if (!meta.portionUnit || meta.portionQuantity == null) {
    return null
  }

  if (meta.portionUnit === 'servings') {
    const qty = meta.portionQuantity
    const label = qty === 1 ? 'serving' : 'servings'
    return `${qty} ${label}`
  }

  const grams = meta.portionQuantity
  return grams % 1 === 0 ? `${grams}g` : `${grams.toFixed(1)}g`
}