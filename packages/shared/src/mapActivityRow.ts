import type { Activity, ActivityRow } from './types.js'

export function mapActivityRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    name: row.name,
    activityType: row.activity_type,
    activityDate: row.activity_date,
    loggedAt: row.created_at,
    distanceMeters: row.distance_meters,
    movingTimeSeconds: row.moving_time_seconds,
    averageHeartrate: row.average_heartrate,
    maxHeartrate: row.max_heartrate,
    calories: row.calories,
    workoutId: row.workout_id ?? null,
    workoutSetsLogged:
      row.workout_sets_logged === null || row.workout_sets_logged === undefined
        ? null
        : typeof row.workout_sets_logged === 'number'
          ? row.workout_sets_logged
          : Number.parseFloat(String(row.workout_sets_logged)),
    exercises: [],
  }
}
