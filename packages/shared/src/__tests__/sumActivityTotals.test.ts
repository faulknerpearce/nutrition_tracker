import { describe, expect, it } from 'vitest'
import { sumActivityTotals } from '../sumActivityTotals.js'
import type { Activity } from '../types.js'

function activity(partial: Partial<Activity> & Pick<Activity, 'id' | 'name'>): Activity {
  return {
    activityType: 'Run',
    activityDate: '2026-06-25',
    loggedAt: '2026-06-25T12:00:00Z',
    distanceMeters: null,
    movingTimeSeconds: 0,
    averageHeartrate: null,
    maxHeartrate: null,
    calories: null,
    workoutId: null,
    workoutSetsLogged: null,
    exercises: [],
    ...partial,
  }
}

describe('sumActivityTotals', () => {
  it('returns zeros for an empty list', () => {
    expect(sumActivityTotals([])).toEqual({
      calories: 0,
      movingTimeSeconds: 0,
      distanceMeters: 0,
    })
  })

  it('sums calories, time, and distance across activities', () => {
    const totals = sumActivityTotals([
      activity({
        id: 'a',
        name: 'Run',
        calories: 300,
        movingTimeSeconds: 1800,
        distanceMeters: 5000,
      }),
      activity({
        id: 'b',
        name: 'Lift',
        calories: 150,
        movingTimeSeconds: 2400,
        distanceMeters: null,
      }),
    ])

    expect(totals).toEqual({
      calories: 450,
      movingTimeSeconds: 4200,
      distanceMeters: 5000,
    })
  })
})
