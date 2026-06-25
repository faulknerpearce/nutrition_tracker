import {
  formatDistance,
  formatDuration,
  sumActivityTotals,
  type Activity,
  type NetBalance,
  type Totals,
} from '@nutrition-tracker/shared'

export interface RingProgress {
  pct: number
  capped: number
  overGoal: boolean
}

export interface MacroSegment {
  label: string
  grams: number
  calories: number
  color: string
}

export interface ActivityBarRow {
  label: string
  value: number
  displayValue: string
  max: number
  color: string
  gradient: string
}

const MACRO_COLORS = {
  protein: '#059669',
  carbs: '#d97706',
  fat: '#db2777',
} as const

export function ringProgress(value: number, goal: number): RingProgress {
  const pct = goal > 0 ? Math.round((value / goal) * 100) : 0
  const capped = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  return { pct, capped, overGoal: goal > 0 && value > goal }
}

export function netRingProgress(balance: NetBalance): RingProgress {
  return ringProgress(balance.net, balance.goalHigh)
}

export function macroCalorieSplit(totals: Totals): MacroSegment[] {
  const proteinCal = totals.protein * 4
  const carbsCal = totals.carbs * 4
  const fatCal = totals.fat * 9

  return [
    { label: 'Protein', grams: totals.protein, calories: proteinCal, color: MACRO_COLORS.protein },
    { label: 'Carbs', grams: totals.carbs, calories: carbsCal, color: MACRO_COLORS.carbs },
    { label: 'Fat', grams: totals.fat, calories: fatCal, color: MACRO_COLORS.fat },
  ]
}

export function macroTotalCalories(segments: readonly MacroSegment[]): number {
  return segments.reduce((sum, s) => sum + s.calories, 0)
}

const ACTIVITY_TIME_MAX_SECONDS = 7200
const ACTIVITY_COUNT_MAX = 5
const ACTIVITY_DISTANCE_FALLBACK_METERS = 10_000

export function buildActivityBarData(
  activities: readonly Activity[],
  calorieGoal: number,
): ActivityBarRow[] {
  const totals = sumActivityTotals(activities)
  const count = activities.length
  const distanceMax = Math.max(totals.distanceMeters, ACTIVITY_DISTANCE_FALLBACK_METERS, 1)

  return [
    {
      label: 'Calories Burned',
      value: totals.calories,
      displayValue: totals.calories > 0 ? `${totals.calories.toLocaleString()} kcal` : '0 kcal',
      max: Math.max(calorieGoal, totals.calories, 1),
      color: '#ea580c',
      gradient: 'linear-gradient(90deg, #ea580c, #fb923c)',
    },
    {
      label: 'Active Time',
      value: totals.movingTimeSeconds,
      displayValue: formatDuration(totals.movingTimeSeconds),
      max: Math.max(ACTIVITY_TIME_MAX_SECONDS, totals.movingTimeSeconds, 1),
      color: '#134e4b',
      gradient: 'linear-gradient(90deg, #134e4b, #14b8a6)',
    },
    {
      label: 'Distance',
      value: totals.distanceMeters,
      displayValue: formatDistance(totals.distanceMeters > 0 ? totals.distanceMeters : null),
      max: distanceMax,
      color: '#2563eb',
      gradient: 'linear-gradient(90deg, #2563eb, #60a5fa)',
    },
    {
      label: 'Activities',
      value: count,
      displayValue: String(count),
      max: Math.max(ACTIVITY_COUNT_MAX, count, 1),
      color: '#059669',
      gradient: 'linear-gradient(90deg, #059669, #34d399)',
    },
  ]
}