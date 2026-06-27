import { describe, expect, it } from 'vitest'
import {
  annotateEntryLogTimes,
  annotateMealMarkers,
  groupEntriesByHour,
  mapEntriesToLogTimes,
  mapEntriesToMealMarkers,
  niceCalorieAxisMax,
} from '../groupEntriesByHour.js'
import type { FoodEntry } from '../types.js'

function makeEntry(loggedAt: string, calories = 0): Pick<FoodEntry, 'loggedAt' | 'calories'> {
  return { loggedAt, calories }
}

describe('groupEntriesByHour', () => {
  it('returns 24 buckets with zero counts for empty input', () => {
    const buckets = groupEntriesByHour([], 'UTC')
    expect(buckets).toHaveLength(24)
    expect(buckets.every((bucket) => bucket.entryCount === 0)).toBe(true)
    expect(buckets.map((bucket) => bucket.hour)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    ])
  })

  it('counts entries in the correct UTC hour', () => {
    const buckets = groupEntriesByHour(
      [
        makeEntry('2026-06-22T08:15:00Z'),
        makeEntry('2026-06-22T08:45:00Z'),
        makeEntry('2026-06-22T12:00:00Z'),
      ],
      'UTC',
    )

    expect(buckets[8].entryCount).toBe(2)
    expect(buckets[12].entryCount).toBe(1)
    expect(buckets[7].entryCount).toBe(0)
  })

  it('buckets by local hour in a non-UTC timezone', () => {
    const buckets = groupEntriesByHour(
      [makeEntry('2026-06-22T15:00:00Z')],
      'America/Los_Angeles',
    )

    expect(buckets[8].entryCount).toBe(1)
  })
})

describe('mapEntriesToLogTimes', () => {
  it('maps each entry to its local hour and minute', () => {
    const times = mapEntriesToLogTimes(
      [
        makeEntry('2026-06-22T08:15:00Z'),
        makeEntry('2026-06-22T08:45:00Z'),
      ],
      'UTC',
    )

    expect(times).toEqual([
      { hour: 8, minute: 15 },
      { hour: 8, minute: 45 },
    ])
  })
})

describe('annotateEntryLogTimes', () => {
  it('clusters entries logged at the same minute', () => {
    const annotated = annotateEntryLogTimes([
      { hour: 8, minute: 15 },
      { hour: 8, minute: 15 },
      { hour: 9, minute: 0 },
    ])

    expect(annotated).toEqual([
      { hour: 8, minute: 15, slotIndex: 0, slotTotal: 2 },
      { hour: 8, minute: 15, slotIndex: 1, slotTotal: 2 },
      { hour: 9, minute: 0, slotIndex: 0, slotTotal: 1 },
    ])
  })
})

describe('mapEntriesToMealMarkers', () => {
  it('maps each entry to its local hour and calories', () => {
    const markers = mapEntriesToMealMarkers(
      [
        makeEntry('2026-06-22T08:15:00Z', 450),
        makeEntry('2026-06-22T12:00:00Z', 200),
      ],
      'UTC',
    )

    expect(markers).toEqual([
      { hour: 8, calories: 450 },
      { hour: 12, calories: 200 },
    ])
  })
})

describe('annotateMealMarkers', () => {
  it('clusters entries logged at the same hour with the same calories', () => {
    const annotated = annotateMealMarkers([
      { hour: 8, calories: 450 },
      { hour: 8, calories: 450 },
      { hour: 9, calories: 200 },
    ])

    expect(annotated).toEqual([
      { hour: 8, calories: 450, slotIndex: 0, slotTotal: 2 },
      { hour: 8, calories: 450, slotIndex: 1, slotTotal: 2 },
      { hour: 9, calories: 200, slotIndex: 0, slotTotal: 1 },
    ])
  })
})

describe('niceCalorieAxisMax', () => {
  it('rounds up to a readable step', () => {
    expect(niceCalorieAxisMax(0)).toBe(100)
    expect(niceCalorieAxisMax(180)).toBe(200)
    expect(niceCalorieAxisMax(450)).toBe(500)
    expect(niceCalorieAxisMax(850)).toBe(1000)
  })
})