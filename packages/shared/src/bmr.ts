import type { UserProfile } from './profile.js'

export type ProfileGender = 'male' | 'female' | 'prefer_not_to_say'

export const DEFAULT_PROFILE_GENDER: ProfileGender = 'female'

/** Used when body stats are incomplete and no override is set. */
export const FALLBACK_BMR_KCAL = 1200

export type BmrSource = 'override' | 'calculated' | 'fallback'

export interface BmrResolution {
  bmr: number
  calculatedBmr: number | null
  source: BmrSource
}

export interface BmrInputs {
  weightKg: number
  heightCm: number
  age: number
  gender: ProfileGender
}

export function parseProfileGender(raw: unknown): ProfileGender {
  if (raw === 'male' || raw === 'female' || raw === 'prefer_not_to_say') return raw
  return DEFAULT_PROFILE_GENDER
}

export function canComputeBmrFromBodyStats(
  profile: Pick<UserProfile, 'age' | 'heightCm' | 'weightKg'>,
): boolean {
  return profile.age !== null && profile.heightCm !== null && profile.weightKg !== null
}

/** Mifflin-St Jeor; prefer-not-to-say uses the female formula. */
export function computeMifflinStJeorBmr(input: BmrInputs): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age
  const offset = input.gender === 'male' ? 5 : -161
  return Math.round(base + offset)
}

export function resolveBmr(
  profile: Pick<UserProfile, 'age' | 'heightCm' | 'weightKg' | 'gender' | 'bmrOverride'>,
): BmrResolution {
  const calculatedBmr = canComputeBmrFromBodyStats(profile)
    ? computeMifflinStJeorBmr({
        weightKg: profile.weightKg!,
        heightCm: profile.heightCm!,
        age: profile.age!,
        gender: profile.gender,
      })
    : null

  if (profile.bmrOverride !== null) {
    return {
      bmr: Math.round(profile.bmrOverride),
      calculatedBmr,
      source: 'override',
    }
  }

  if (calculatedBmr !== null) {
    return { bmr: calculatedBmr, calculatedBmr, source: 'calculated' }
  }

  return { bmr: FALLBACK_BMR_KCAL, calculatedBmr: null, source: 'fallback' }
}