import {
  mapRow,
  sumTotals,
  calGoal,
  proGoal,
  carbGoal,
  caffeineGoal,
  goals,
  todayISO,
  buildInsertPayload,
  parseEntryInput,
  type FoodEntry,
  type NewFoodEntry,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export { sumTotals, calGoal, proGoal, carbGoal, caffeineGoal, goals, todayISO }
export type { FoodEntry, NewFoodEntry }

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  if (!user) throw new Error('Not signed in')
  return user.id
}

export async function fetchEntries(): Promise<FoodEntry[]> {
  const date = todayISO()
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('entry_date', date)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

export async function addEntry(input: NewFoodEntry): Promise<FoodEntry> {
  const userId = await requireUserId()
  const parsed = parseEntryInput(input as Record<string, unknown>)
  if (!parsed.ok) throw new Error(parsed.error)

  const entry = {
    ...buildInsertPayload(parsed.value, crypto.randomUUID(), userId),
    entry_date: todayISO(),
  }
  const { data, error } = await supabase.from('food_entries').insert(entry).select().single()
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('food_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}