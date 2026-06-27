import { describe, expect, it } from 'vitest'
import { mapActivityRow } from '../mapActivityRow.js'

describe('mapActivityRow', () => {
  it('maps snake_case database rows to camelCase activities', () => {
    const activity = mapActivityRow({
      id: 'abc',
      user_id: 'user-1',
      name: 'Evening Ride',
      activity_type: 'Ride',
      activity_date: '2026-06-23',
      distance_meters: 15000,
      moving_time_seconds: 3600,
      average_heartrate: 132,
      max_heartrate: 155,
      calories: 650,
      created_at: '2026-06-23T18:00:00Z',
    })

    expect(activity).toEqual({
      id: 'abc',
      name: 'Evening Ride',
      activityType: 'Ride',
      activityDate: '2026-06-23',
      loggedAt: '2026-06-23T18:00:00Z',
      distanceMeters: 15000,
      movingTimeSeconds: 3600,
      averageHeartrate: 132,
      maxHeartrate: 155,
      calories: 650,
      workoutId: null,
      workoutSetsLogged: null,
      exercises: [],
    })
  })
})
