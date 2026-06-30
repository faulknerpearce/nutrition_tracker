import {
  buildProfileUpdatePayload,
  detectBrowserTimeZone,
  mapProfileRow,
  type ProfileUpdate,
  type UserProfile,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export type { ProfileUpdate, UserProfile }

const PROFILE_COLUMNS = 'display_name, nutrition_goals, age, height_cm, weight_kg, time_zone'

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Profile not found')

  const profile = mapProfileRow(data)
  const browserTimeZone = detectBrowserTimeZone()
  if (profile.timeZone !== browserTimeZone) {
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ time_zone: browserTimeZone })
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .single()
    if (updateError) throw new Error(updateError.message)
    return mapProfileRow(updated)
  }

  return profile
}

export async function saveProfileUpdate(
  userId: string,
  update: ProfileUpdate,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(buildProfileUpdatePayload(update))
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  if (update.displayName !== undefined) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: update.displayName.trim() },
    })
    if (authError) throw new Error(authError.message)
  }

  return mapProfileRow(data)
}