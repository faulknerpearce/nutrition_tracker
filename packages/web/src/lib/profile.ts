import {
  buildProfileUpdatePayload,
  detectBrowserTimeZone,
  mapProfileRow,
  type ProfileUpdate,
  type UserProfile,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export type { ProfileUpdate, UserProfile }

const BASE_PROFILE_COLUMNS =
  'display_name, nutrition_goals, age, height_cm, weight_kg, time_zone'
const EXTENDED_PROFILE_COLUMNS = `${BASE_PROFILE_COLUMNS}, gender, bmr_override`

function isMissingProfileColumnError(message: string): boolean {
  return (
    /could not find the '?(gender|bmr_override)'? column/i.test(message) ||
    /column profiles\.(gender|bmr_override) does not exist/i.test(message)
  )
}

async function fetchProfileRow(
  userId: string,
  columns: string,
): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select(columns)
    .eq('id', userId)
    .maybeSingle()

  if (error) return { data: null, error }
  return { data: data as Record<string, unknown> | null, error: null }
}

async function loadProfileRow(userId: string): Promise<Record<string, unknown>> {
  const extended = await fetchProfileRow(userId, EXTENDED_PROFILE_COLUMNS)
  if (!extended.error && extended.data) return extended.data

  if (extended.error && !isMissingProfileColumnError(extended.error.message)) {
    throw new Error(extended.error.message)
  }

  const base = await fetchProfileRow(userId, BASE_PROFILE_COLUMNS)
  if (base.error) throw new Error(base.error.message)
  if (!base.data) throw new Error('Profile not found')
  return base.data
}

async function saveProfileRow(
  userId: string,
  update: ProfileUpdate,
  columns: string,
): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> {
  const payload = buildProfileUpdatePayload(update)
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select(columns)
    .single()

  if (error) return { data: null, error }
  return { data: data as unknown as Record<string, unknown>, error: null }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const row = await loadProfileRow(userId)
  const profile = mapProfileRow(row as Parameters<typeof mapProfileRow>[0])
  const browserTimeZone = detectBrowserTimeZone()
  if (profile.timeZone !== browserTimeZone) {
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ time_zone: browserTimeZone })
      .eq('id', userId)
      .select(BASE_PROFILE_COLUMNS)
      .single()
    if (updateError) throw new Error(updateError.message)
    return mapProfileRow({
      ...row,
      ...(updated as Record<string, unknown>),
      time_zone: browserTimeZone,
    } as Parameters<typeof mapProfileRow>[0])
  }

  return profile
}

export async function saveProfileUpdate(
  userId: string,
  update: ProfileUpdate,
): Promise<UserProfile> {
  let saved = await saveProfileRow(userId, update, EXTENDED_PROFILE_COLUMNS)

  if (saved.error && isMissingProfileColumnError(saved.error.message)) {
    const legacyUpdate: ProfileUpdate = { ...update, gender: undefined, bmrOverride: undefined }
    saved = await saveProfileRow(userId, legacyUpdate, BASE_PROFILE_COLUMNS)
    if (!saved.error && saved.data) {
      const current = await loadProfileRow(userId)
      saved.data = { ...current, ...saved.data }
    }
  }

  if (saved.error) throw new Error(saved.error.message)
  if (!saved.data) throw new Error('Profile not found')

  if (update.displayName !== undefined) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: update.displayName.trim() },
    })
    if (authError) throw new Error(authError.message)
  }

  const profile = mapProfileRow(saved.data as Parameters<typeof mapProfileRow>[0])
  return {
    ...profile,
    gender: update.gender ?? profile.gender,
    bmrOverride: update.bmrOverride !== undefined ? update.bmrOverride : profile.bmrOverride,
  }
}