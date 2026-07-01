import { parseProfileGender, type ProfileGender } from './bmr.js'
import { DEFAULT_TIMEZONE, isValidTimeZone } from './dateUtils.js'
import { parseNutritionGoals, type NutritionGoals } from './goals.js'
import type { ValidationResult } from './validation.js'

export type { ProfileGender } from './bmr.js'

export interface UserBodyStats {
  age: number | null
  heightCm: number | null
  weightKg: number | null
}

export interface UserProfile extends UserBodyStats {
  displayName: string
  nutritionGoals: NutritionGoals
  gender: ProfileGender
  bmrOverride: number | null
  /** IANA timezone used for calendar-day food and activity logs. */
  timeZone: string
}

export interface ProfileUpdate {
  displayName?: string
  age?: number | null
  heightCm?: number | null
  weightKg?: number | null
  gender?: ProfileGender
  bmrOverride?: number | null
  nutritionGoals?: NutritionGoals
  timeZone?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseOptionalInt(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null
  return Math.round(raw)
}

function parseOptionalWeight(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null
  return Math.round(raw * 10) / 10
}

function parseTimeZone(raw: unknown): string {
  if (typeof raw === 'string' && isValidTimeZone(raw)) return raw
  return DEFAULT_TIMEZONE
}

function parseOptionalBmrOverride(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const value = typeof raw === 'number' ? raw : Number.parseFloat(String(raw))
  if (!Number.isFinite(value)) return null
  return Math.round(value)
}

export function mapProfileRow(row: {
  display_name: string
  nutrition_goals: unknown
  age?: number | null
  height_cm?: number | null
  weight_kg?: number | string | null
  gender?: string | null
  bmr_override?: number | string | null
  time_zone?: string | null
}): UserProfile {
  const weightRaw = row.weight_kg
  const weightKg =
    weightRaw === null || weightRaw === undefined
      ? null
      : typeof weightRaw === 'number'
        ? weightRaw
        : Number.parseFloat(String(weightRaw))

  return {
    displayName: row.display_name,
    nutritionGoals: parseNutritionGoals(row.nutrition_goals),
    age: row.age ?? null,
    heightCm: row.height_cm ?? null,
    weightKg: Number.isFinite(weightKg) ? weightKg : null,
    gender: parseProfileGender(row.gender),
    bmrOverride: parseOptionalBmrOverride(row.bmr_override),
    timeZone: parseTimeZone(row.time_zone),
  }
}

export function validateBodyStats(input: UserBodyStats): ValidationResult<UserBodyStats> {
  if (input.age !== null) {
    if (!Number.isInteger(input.age) || input.age < 13 || input.age > 120) {
      return { ok: false, error: 'Age must be between 13 and 120' }
    }
  }

  if (input.heightCm !== null) {
    if (!Number.isInteger(input.heightCm) || input.heightCm < 100 || input.heightCm > 250) {
      return { ok: false, error: 'Height must be between 100 and 250 cm' }
    }
  }

  if (input.weightKg !== null) {
    if (!Number.isFinite(input.weightKg) || input.weightKg < 30 || input.weightKg > 300) {
      return { ok: false, error: 'Weight must be between 30 and 300 kg' }
    }
  }

  return { ok: true, value: input }
}

export function validateProfileUpdate(input: ProfileUpdate): ValidationResult<ProfileUpdate> {
  if (input.displayName !== undefined) {
    const trimmed = input.displayName.trim()
    if (trimmed === '') {
      return { ok: false, error: 'Display name is required' }
    }
    if (trimmed.length > 80) {
      return { ok: false, error: 'Display name must be 80 characters or fewer' }
    }
  }

  if (input.age !== undefined && input.age !== null) {
    if (!Number.isInteger(input.age) || input.age < 13 || input.age > 120) {
      return { ok: false, error: 'Age must be between 13 and 120' }
    }
  }

  if (input.heightCm !== undefined && input.heightCm !== null) {
    if (!Number.isInteger(input.heightCm) || input.heightCm < 100 || input.heightCm > 250) {
      return { ok: false, error: 'Height must be between 100 and 250 cm' }
    }
  }

  if (input.weightKg !== undefined && input.weightKg !== null) {
    if (!Number.isFinite(input.weightKg) || input.weightKg < 30 || input.weightKg > 300) {
      return { ok: false, error: 'Weight must be between 30 and 300 kg' }
    }
  }

  if (input.gender !== undefined && !['male', 'female', 'prefer_not_to_say'].includes(input.gender)) {
    return { ok: false, error: 'Gender must be male, female, or prefer_not_to_say' }
  }

  if (input.bmrOverride !== undefined && input.bmrOverride !== null) {
    if (!Number.isFinite(input.bmrOverride) || input.bmrOverride < 800 || input.bmrOverride > 5000) {
      return { ok: false, error: 'BMR override must be between 800 and 5000 kcal' }
    }
  }

  if (input.timeZone !== undefined && !isValidTimeZone(input.timeZone)) {
    return { ok: false, error: 'timeZone must be a valid IANA timezone' }
  }

  return { ok: true, value: input }
}

export function parseBodyStatsInput(input: Record<string, unknown>): UserBodyStats {
  return {
    age: parseOptionalInt(input.age),
    heightCm: parseOptionalInt(input.heightCm ?? input.height_cm),
    weightKg: parseOptionalWeight(input.weightKg ?? input.weight_kg),
  }
}

export function buildProfileUpdatePayload(input: ProfileUpdate): {
  display_name?: string
  age?: number | null
  height_cm?: number | null
  weight_kg?: number | null
  gender?: ProfileGender
  bmr_override?: number | null
  nutrition_goals?: NutritionGoals
  time_zone?: string
} {
  const payload: {
    display_name?: string
    age?: number | null
    height_cm?: number | null
    weight_kg?: number | null
    gender?: ProfileGender
    bmr_override?: number | null
    nutrition_goals?: NutritionGoals
    time_zone?: string
  } = {}

  if (input.displayName !== undefined) {
    payload.display_name = input.displayName.trim()
  }
  if (input.age !== undefined) payload.age = input.age
  if (input.heightCm !== undefined) payload.height_cm = input.heightCm
  if (input.weightKg !== undefined) payload.weight_kg = input.weightKg
  if (input.gender !== undefined) payload.gender = input.gender
  if (input.bmrOverride !== undefined) payload.bmr_override = input.bmrOverride
  if (input.nutritionGoals !== undefined) payload.nutrition_goals = input.nutritionGoals
  if (input.timeZone !== undefined) payload.time_zone = input.timeZone

  return payload
}

export function mergeProfileRow(
  current: UserProfile,
  row: Record<string, unknown> | null | undefined,
): UserProfile {
  if (!isRecord(row)) return current
  return mapProfileRow({
    display_name:
      typeof row.display_name === 'string' ? row.display_name : current.displayName,
    nutrition_goals: row.nutrition_goals ?? current.nutritionGoals,
    age: row.age === undefined ? current.age : (row.age as number | null),
    height_cm: row.height_cm === undefined ? current.heightCm : (row.height_cm as number | null),
    weight_kg: row.weight_kg === undefined ? current.weightKg : (row.weight_kg as number | null),
    gender: row.gender === undefined ? current.gender : parseProfileGender(row.gender),
    bmr_override:
      row.bmr_override === undefined ? current.bmrOverride : parseOptionalBmrOverride(row.bmr_override),
    time_zone:
      row.time_zone === undefined || row.time_zone === null
        ? current.timeZone
        : parseTimeZone(row.time_zone),
  })
}