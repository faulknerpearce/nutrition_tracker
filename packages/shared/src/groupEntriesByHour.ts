import { hourInTimeZone, minuteInTimeZone } from './dateUtils.js'
import type { FoodEntry } from './types.js'

export interface HourlyBucket {
  hour: number
  entryCount: number
}

export interface EntryLogTime {
  hour: number
  minute: number
}

export interface AnnotatedEntryLogTime extends EntryLogTime {
  slotIndex: number
  slotTotal: number
}

export interface EntryMealMarker {
  hour: number
  calories: number
}

export interface AnnotatedEntryMealMarker extends EntryMealMarker {
  slotIndex: number
  slotTotal: number
}

export function groupEntriesByHour(
  entries: readonly Pick<FoodEntry, 'loggedAt'>[],
  timeZone: string,
): HourlyBucket[] {
  const counts = Array.from({ length: 24 }, () => 0)

  for (const entry of entries) {
    const hour = hourInTimeZone(entry.loggedAt, timeZone)
    if (hour >= 0 && hour < 24) {
      counts[hour]++
    }
  }

  return counts.map((entryCount, hour) => ({ hour, entryCount }))
}

export function mapEntriesToLogTimes(
  entries: readonly Pick<FoodEntry, 'loggedAt'>[],
  timeZone: string,
): EntryLogTime[] {
  return entries.map((entry) => ({
    hour: hourInTimeZone(entry.loggedAt, timeZone),
    minute: minuteInTimeZone(entry.loggedAt, timeZone),
  }))
}

/** Spread dots that share the same hour and calorie amount across a small horizontal cluster. */
export function annotateMealMarkers(
  markers: readonly EntryMealMarker[],
): AnnotatedEntryMealMarker[] {
  const slotTotals = new Map<string, number>()
  for (const marker of markers) {
    const key = `${marker.hour}:${marker.calories}`
    slotTotals.set(key, (slotTotals.get(key) ?? 0) + 1)
  }

  const slotIndexes = new Map<string, number>()
  return markers.map((marker) => {
    const key = `${marker.hour}:${marker.calories}`
    const slotIndex = slotIndexes.get(key) ?? 0
    slotIndexes.set(key, slotIndex + 1)
    return {
      ...marker,
      slotIndex,
      slotTotal: slotTotals.get(key) ?? 1,
    }
  })
}

/** Spread dots that share the same hour and minute across a small horizontal cluster. */
export function annotateEntryLogTimes(times: readonly EntryLogTime[]): AnnotatedEntryLogTime[] {
  const slotTotals = new Map<string, number>()
  for (const time of times) {
    const key = `${time.hour}:${time.minute}`
    slotTotals.set(key, (slotTotals.get(key) ?? 0) + 1)
  }

  const slotIndexes = new Map<string, number>()
  return times.map((time) => {
    const key = `${time.hour}:${time.minute}`
    const slotIndex = slotIndexes.get(key) ?? 0
    slotIndexes.set(key, slotIndex + 1)
    return {
      ...time,
      slotIndex,
      slotTotal: slotTotals.get(key) ?? 1,
    }
  })
}

export function mapEntriesToMealMarkers(
  entries: readonly Pick<FoodEntry, 'loggedAt' | 'calories'>[],
  timeZone: string,
): EntryMealMarker[] {
  return entries.map((entry) => ({
    hour: hourInTimeZone(entry.loggedAt, timeZone),
    calories: entry.calories,
  }))
}

/** Round up to a readable calorie axis maximum. */
export function niceCalorieAxisMax(maxCalories: number): number {
  if (maxCalories <= 0) return 100
  const step = maxCalories <= 200 ? 50 : maxCalories <= 500 ? 100 : maxCalories <= 1000 ? 200 : 500
  return Math.ceil(maxCalories / step) * step
}