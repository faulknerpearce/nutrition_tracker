import {
  buildInsertPayload,
  buildUpdatePayload,
  mapRow,
  offsetDateISO,
  parseEntryInput,
  sumTotals,
  todayISO,
  type FoodEntry,
  type NewFoodEntry,
  type Totals,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export type { FoodEntry, NewFoodEntry }

export interface DaySummary {
  date: string
  entries: FoodEntry[]
  totals: Totals
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  if (!user) throw new Error('Not signed in')
  return user.id
}

export async function fetchEntries(date: string = todayISO()): Promise<FoodEntry[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('entry_date', date)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

export async function fetchDaySummaries(daysBack = 30): Promise<DaySummary[]> {
  const today = todayISO()
  const startDate = offsetDateISO(daysBack)

  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .gte('entry_date', startDate)
    .lte('entry_date', today)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)

  const byDate = new Map<string, FoodEntry[]>()
  for (const row of data ?? []) {
    const date = row.entry_date
    const list = byDate.get(date) ?? []
    list.push(mapRow(row))
    byDate.set(date, list)
  }

  if (!byDate.has(today)) {
    byDate.set(today, [])
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({
      date,
      entries,
      totals: sumTotals(entries),
    }))
}

export async function addEntry(
  input: NewFoodEntry,
  options?: { entryDate?: string },
): Promise<FoodEntry> {
  const userId = await requireUserId()
  const parsed = parseEntryInput(input as Record<string, unknown>)
  if (!parsed.ok) throw new Error(parsed.error)

  const entry = {
    ...buildInsertPayload(parsed.value, crypto.randomUUID(), userId),
    entry_date: options?.entryDate ?? todayISO(),
  }
  const { data, error } = await supabase.from('food_entries').insert(entry).select().single()
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function updateEntry(id: string, input: NewFoodEntry): Promise<FoodEntry> {
  const parsed = parseEntryInput(input as Record<string, unknown>)
  if (!parsed.ok) throw new Error(parsed.error)

  const { data, error } = await supabase
    .from('food_entries')
    .update(buildUpdatePayload(parsed.value))
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('food_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
