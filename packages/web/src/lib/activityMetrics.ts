import {
  formatDistance,
  formatDuration,
  sumActivityTotals,
  type Activity,
} from '@nutrition-tracker/shared'

export interface ActivityMetricConfig {
  label: string
  value: string
  detail: string
  color: string
  iconBg: string
  iconClass: string
}

export function buildActivityMetricConfigs(
  activities: readonly Activity[],
): ActivityMetricConfig[] {
  const totals = sumActivityTotals(activities)
  const count = activities.length

  return [
    {
      label: 'Calories Burned',
      value: totals.calories > 0 ? totals.calories.toLocaleString() : '0',
      detail:
        count > 0
          ? `from ${count} ${count === 1 ? 'activity' : 'activities'}`
          : 'no activities logged',
      color: '#ea580c',
      iconBg: '#fed7aa',
      iconClass: 'fa-fire',
    },
    {
      label: 'Active Time',
      value: formatDuration(totals.movingTimeSeconds),
      detail: 'total moving time',
      color: '#134e4b',
      iconBg: '#ccfbf1',
      iconClass: 'fa-clock',
    },
    {
      label: 'Distance',
      value: formatDistance(totals.distanceMeters > 0 ? totals.distanceMeters : null),
      detail: 'total distance covered',
      color: '#0d9488',
      iconBg: '#ccfbf1',
      iconClass: 'fa-route',
    },
    {
      label: 'Activities',
      value: String(count),
      detail: count === 1 ? 'workout logged' : 'workouts logged',
      color: '#059669',
      iconBg: '#d1fae5',
      iconClass: 'fa-heart-pulse',
    },
  ]
}
