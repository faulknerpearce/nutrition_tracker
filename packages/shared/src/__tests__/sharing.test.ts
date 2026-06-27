import { describe, expect, it } from 'vitest'
import {
  buildForkActivityInput,
  buildForkEntryInput,
  buildForkRecipeInput,
  buildForkWorkoutInput,
} from '../sharing.js'
import type { Activity, FoodEntry } from '../types.js'

const sampleEntry: FoodEntry = {
  id: 'entry-1',
  icon: 'fa-utensils',
  iconBg: '#fff7ed',
  iconColor: '#ea580c',
  name: 'Oatmeal',
  description: 'Breakfast',
  calories: 350,
  protein: 12,
  carbs: 58,
  fat: 6,
  fiber: 8,
  caffeine: 0,
  loggedAt: '2026-06-22T08:15:00Z',
}

const sampleActivity: Activity = {
  id: 'activity-1',
  name: 'Morning Run',
  activityType: 'Run',
  activityDate: '2026-06-25',
  loggedAt: '2026-06-25T07:00:00Z',
  distanceMeters: 5000,
  movingTimeSeconds: 1800,
  averageHeartrate: 145,
  maxHeartrate: 162,
  calories: 320,
  workoutId: null,
  workoutSetsLogged: null,
  exercises: [],
}

describe('buildForkActivityInput', () => {
  it('copies activity fields without id, date, or exercises', () => {
    const input = buildForkActivityInput(sampleActivity)
    expect(input).toEqual({
      name: 'Morning Run',
      activityType: 'Run',
      movingTimeSeconds: 1800,
      distanceMeters: 5000,
      averageHeartrate: 145,
      maxHeartrate: 162,
      calories: 320,
    })
    expect(input).not.toHaveProperty('id')
    expect(input).not.toHaveProperty('loggedAt')
  })
})

describe('buildForkEntryInput', () => {
  it('copies food entry fields without id or loggedAt', () => {
    const input = buildForkEntryInput(sampleEntry)
    expect(input).toEqual({
      icon: 'fa-utensils',
      iconBg: '#fff7ed',
      iconColor: '#ea580c',
      name: 'Oatmeal',
      description: 'Breakfast',
      calories: 350,
      protein: 12,
      carbs: 58,
      fat: 6,
      fiber: 8,
      caffeine: 0,
    })
    expect(input).not.toHaveProperty('id')
    expect(input).not.toHaveProperty('loggedAt')
  })
})

describe('buildForkRecipeInput', () => {
  it('copies recipe fields without ingredient ids', () => {
    const input = buildForkRecipeInput({
      id: 'recipe-1',
      name: 'Oats',
      description: 'Breakfast',
      icon: 'fa-utensils',
      iconBg: '#fff',
      iconColor: '#000',
      defaultServings: 2,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
      ingredients: [
        {
          id: 'ing-1',
          name: 'Rolled oats',
          amount: '1 cup',
          sortOrder: 0,
          calories: 300,
          protein: 10,
          carbs: 50,
          fat: 5,
          fiber: 8,
          caffeine: 0,
        },
      ],
      batchTotals: {
        calories: 300,
        protein: 10,
        carbs: 50,
        fat: 5,
        fiber: 8,
        caffeine: 0,
      },
      perServingTotals: {
        calories: 150,
        protein: 5,
        carbs: 25,
        fat: 2,
        fiber: 4,
        caffeine: 0,
      },
    })

    expect(input.name).toBe('Oats')
    expect(input.ingredients).toHaveLength(1)
    expect(input.ingredients[0]).not.toHaveProperty('id')
    expect(input.ingredients[0].name).toBe('Rolled oats')
  })
})

describe('buildForkWorkoutInput', () => {
  it('copies workout fields without exercise ids', () => {
    const input = buildForkWorkoutInput({
      id: 'workout-1',
      name: 'Push day',
      description: '',
      icon: 'fa-dumbbell',
      iconBg: '#fff',
      iconColor: '#000',
      defaultDurationMinutes: 30,
      defaultCalories: 200,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
      exercises: [
        {
          id: 'ex-1',
          name: 'Push-ups',
          sortOrder: 0,
          targetReps: 20,
        },
      ],
    })

    expect(input.name).toBe('Push day')
    expect(input.exercises).toHaveLength(1)
    expect(input.exercises[0]).not.toHaveProperty('id')
    expect(input.exercises[0].targetReps).toBe(20)
  })
})