import { DEFAULT_ICON, DEFAULT_ICON_BG, DEFAULT_ICON_COLOR, type IconOption } from './icons.js'
import { validateEntry } from './validation.js'

export interface ParsedEntryInput {
  icon: string
  iconBg: string
  iconColor: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  caffeine: number
  fat: number
  fiber: number
}

const FALLBACK_ICON: IconOption = {
  icon: DEFAULT_ICON,
  label: 'Default',
  bg: DEFAULT_ICON_BG,
  color: DEFAULT_ICON_COLOR,
}

export function parseEntryInput(input: Record<string, unknown>):
  | {
      ok: true
      value: ParsedEntryInput
    }
  | { ok: false; error: string } {
  const candidate = {
    name: typeof input.name === 'string' ? input.name : '',
    description: typeof input.description === 'string' ? input.description : '',
    calories: typeof input.calories === 'number' ? Math.round(input.calories) : NaN,
    protein: typeof input.protein === 'number' ? Math.round(input.protein) : NaN,
    carbs: typeof input.carbs === 'number' ? Math.round(input.carbs) : 0,
    caffeine: typeof input.caffeine === 'number' ? Math.round(input.caffeine) : 0,
    fat: typeof input.fat === 'number' ? Math.round(input.fat) : 0,
    fiber: typeof input.fiber === 'number' ? Math.round(input.fiber) : 0,
  }

  const validated = validateEntry(candidate)
  if (!validated.ok) return validated

  return {
    ok: true,
    value: {
      icon: typeof input.icon === 'string' ? input.icon : FALLBACK_ICON.icon,
      iconBg: typeof input.iconBg === 'string' ? input.iconBg : FALLBACK_ICON.bg,
      iconColor: typeof input.iconColor === 'string' ? input.iconColor : FALLBACK_ICON.color,
      ...validated.value,
    },
  }
}

export function buildUpdatePayload(input: ParsedEntryInput): {
  icon: string
  icon_bg: string
  icon_color: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  caffeine: number
  fat: number
  fiber: number
} {
  return {
    icon: input.icon,
    icon_bg: input.iconBg,
    icon_color: input.iconColor,
    name: input.name,
    description: input.description,
    calories: input.calories,
    protein: input.protein,
    carbs: input.carbs,
    caffeine: input.caffeine,
    fat: input.fat,
    fiber: input.fiber,
  }
}

export function buildInsertPayload(
  input: ParsedEntryInput,
  id: string | undefined,
  userId: string,
): {
  id?: string
  user_id: string
  icon: string
  icon_bg: string
  icon_color: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  caffeine: number
  fat: number
  fiber: number
} {
  return {
    id,
    user_id: userId,
    icon: input.icon,
    icon_bg: input.iconBg,
    icon_color: input.iconColor,
    name: input.name,
    description: input.description,
    calories: input.calories,
    protein: input.protein,
    carbs: input.carbs,
    caffeine: input.caffeine,
    fat: input.fat,
    fiber: input.fiber,
  }
}