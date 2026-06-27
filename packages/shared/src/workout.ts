import type { ValidationResult } from './validation.js'

export const DEFAULT_WORKOUT_ICON = 'fa-dumbbell'
export const DEFAULT_WORKOUT_ICON_BG = '#ecfdf5'
export const DEFAULT_WORKOUT_ICON_COLOR = '#134e4b'

export interface WorkoutExercise {
  id: string
  name: string
  sortOrder: number
  targetReps: number
}

export type NewWorkoutExercise = Omit<WorkoutExercise, 'id'>

export interface Workout {
  id: string
  name: string
  description: string
  icon: string
  iconBg: string
  iconColor: string
  /** Minutes for one full set of the workout. */
  defaultDurationMinutes: number | null
  /** Calories burned for one full set of the workout. */
  defaultCalories: number | null
  createdAt: string
  updatedAt: string
}

export interface WorkoutSummary extends Workout {
  exerciseCount: number
}

export interface WorkoutWithExercises extends Workout {
  exercises: WorkoutExercise[]
}

export interface WorkoutInput {
  name: string
  description?: string
  icon?: string
  iconBg?: string
  iconColor?: string
  defaultDurationMinutes?: number | null
  defaultCalories?: number | null
  exercises: NewWorkoutExercise[]
}

export interface LogWorkoutInput {
  workoutId: string
  setsLogged?: number
  durationMinutes?: number
  calories?: number | null
  activityDate?: string
  loggedAt?: string
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0
}

function parseOptionalNonNegativeInt(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (!isNonNegativeInteger(value)) return null
  return value
}

export function sumRepsCompleted(exercises: Pick<{ repsCompleted: number }, 'repsCompleted'>[]): number {
  return exercises.reduce((sum, exercise) => sum + exercise.repsCompleted, 0)
}

export function validateRepsCompleted(value: unknown): number {
  if (!isPositiveInteger(value)) {
    throw new Error('repsCompleted must be greater than 0')
  }
  return value
}

export function validateWorkoutSetsLogged(value: unknown): number {
  const sets = value ?? 1
  if (!isPositiveInteger(sets)) {
    throw new Error('setsLogged must be a positive integer')
  }
  return sets
}

export function scaleWorkoutMetric(
  perSetValue: number | null,
  setsLogged: number,
): number | null {
  if (perSetValue === null) return null
  return perSetValue * setsLogged
}

export function resolveLogWorkoutMetrics(
  workout: Pick<Workout, 'defaultDurationMinutes' | 'defaultCalories'>,
  setsLogged: number,
  overrides?: { durationMinutes?: number; calories?: number | null },
): { durationMinutes: number; calories: number | null } {
  const durationMinutes =
    overrides?.durationMinutes !== undefined
      ? overrides.durationMinutes
      : (scaleWorkoutMetric(workout.defaultDurationMinutes, setsLogged) ?? 0)

  const calories =
    overrides?.calories !== undefined
      ? overrides.calories
      : scaleWorkoutMetric(workout.defaultCalories, setsLogged)

  return { durationMinutes, calories }
}

export function mapWorkoutRow(row: {
  id: string
  name: string
  description: string
  icon: string
  icon_bg: string
  icon_color: string
  default_duration_minutes?: number | null
  default_calories?: number | null
  created_at: string
  updated_at: string
}): Workout {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    iconBg: row.icon_bg,
    iconColor: row.icon_color,
    defaultDurationMinutes: row.default_duration_minutes ?? null,
    defaultCalories: row.default_calories ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapWorkoutExerciseRow(row: {
  id: string
  sort_order: number
  name: string
  target_reps: number
}): WorkoutExercise {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    targetReps: row.target_reps,
  }
}

export function validateWorkoutExerciseInput(
  input: Partial<NewWorkoutExercise>,
): ValidationResult<NewWorkoutExercise> {
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    return { ok: false, error: 'Exercise name is required' }
  }
  if (!isPositiveInteger(input.targetReps)) {
    return { ok: false, error: 'targetReps must be a positive integer' }
  }

  return {
    ok: true,
    value: {
      name: input.name.trim(),
      sortOrder:
        typeof input.sortOrder === 'number' && Number.isInteger(input.sortOrder)
          ? input.sortOrder
          : 0,
      targetReps: input.targetReps,
    },
  }
}

export function validateWorkoutInput(input: WorkoutInput): ValidationResult<WorkoutInput> {
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    return { ok: false, error: 'Workout name is required' }
  }
  if (input.name.trim().length > 120) {
    return { ok: false, error: 'Workout name must be 120 characters or fewer' }
  }
  if (!Array.isArray(input.exercises) || input.exercises.length === 0) {
    return { ok: false, error: 'At least one exercise is required' }
  }

  const exercises: NewWorkoutExercise[] = []
  for (const exercise of input.exercises) {
    const validated = validateWorkoutExerciseInput(exercise)
    if (!validated.ok) return validated
    exercises.push(validated.value)
  }

  const defaultDurationMinutes = parseOptionalNonNegativeInt(input.defaultDurationMinutes)
  if (input.defaultDurationMinutes !== undefined && input.defaultDurationMinutes !== null) {
    if (defaultDurationMinutes === null) {
      return { ok: false, error: 'defaultDurationMinutes must be a non-negative integer' }
    }
  }

  const defaultCalories = parseOptionalNonNegativeInt(input.defaultCalories)
  if (input.defaultCalories !== undefined && input.defaultCalories !== null) {
    if (defaultCalories === null) {
      return { ok: false, error: 'defaultCalories must be a non-negative integer' }
    }
  }

  return {
    ok: true,
    value: {
      name: input.name.trim(),
      description: typeof input.description === 'string' ? input.description.trim() : '',
      icon: typeof input.icon === 'string' ? input.icon : DEFAULT_WORKOUT_ICON,
      iconBg: typeof input.iconBg === 'string' ? input.iconBg : DEFAULT_WORKOUT_ICON_BG,
      iconColor: typeof input.iconColor === 'string' ? input.iconColor : DEFAULT_WORKOUT_ICON_COLOR,
      defaultDurationMinutes: defaultDurationMinutes,
      defaultCalories: defaultCalories,
      exercises,
    },
  }
}

export function buildWorkoutInsertPayload(
  input: WorkoutInput,
  userId: string,
  id?: string,
): {
  id?: string
  user_id: string
  name: string
  description: string
  icon: string
  icon_bg: string
  icon_color: string
  default_duration_minutes: number | null
  default_calories: number | null
} {
  const validated = validateWorkoutInput(input)
  if (!validated.ok) throw new Error(validated.error)
  const value = validated.value

  return {
    id,
    user_id: userId,
    name: value.name,
    description: value.description ?? '',
    icon: value.icon ?? DEFAULT_WORKOUT_ICON,
    icon_bg: value.iconBg ?? DEFAULT_WORKOUT_ICON_BG,
    icon_color: value.iconColor ?? DEFAULT_WORKOUT_ICON_COLOR,
    default_duration_minutes: value.defaultDurationMinutes ?? null,
    default_calories: value.defaultCalories ?? null,
  }
}

export function buildWorkoutExerciseInsertPayload(
  workoutId: string,
  userId: string,
  exercise: NewWorkoutExercise,
  id?: string,
): {
  id?: string
  workout_id: string
  user_id: string
  sort_order: number
  name: string
  target_reps: number
} {
  const validated = validateWorkoutExerciseInput(exercise)
  if (!validated.ok) throw new Error(validated.error)
  const value = validated.value

  return {
    id,
    workout_id: workoutId,
    user_id: userId,
    sort_order: value.sortOrder,
    name: value.name,
    target_reps: value.targetReps,
  }
}

export function buildActivityExerciseInsertPayload(
  activityId: string,
  userId: string,
  exercise: {
    workoutExerciseId: string | null
    name: string
    sortOrder: number
    repsCompleted: number
  },
  id?: string,
): {
  id?: string
  activity_id: string
  user_id: string
  workout_exercise_id: string | null
  sort_order: number
  name: string
  reps_completed: number
} {
  const repsCompleted = validateRepsCompleted(exercise.repsCompleted)

  return {
    id,
    activity_id: activityId,
    user_id: userId,
    workout_exercise_id: exercise.workoutExerciseId,
    sort_order: exercise.sortOrder,
    name: exercise.name.trim(),
    reps_completed: repsCompleted,
  }
}

/** Snapshot template exercises for a logged workout (per-round targets, not user overrides). */
export function buildWorkoutExerciseSnapshot(
  template: WorkoutWithExercises,
): { workoutExerciseId: string; name: string; sortOrder: number; repsCompleted: number }[] {
  return template.exercises.map((exercise) => ({
    workoutExerciseId: exercise.id,
    name: exercise.name,
    sortOrder: exercise.sortOrder,
    repsCompleted: validateRepsCompleted(exercise.targetReps),
  }))
}