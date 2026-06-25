import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ICON,
  DEFAULT_ICON_BG,
  DEFAULT_ICON_COLOR,
  foodIconOptions,
  workoutIconOptions,
} from '../icons.js'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function assertValidIconOptions(options: readonly { icon: string; label: string; bg: string; color: string }[]) {
  expect(options.length).toBeGreaterThan(0)
  for (const opt of options) {
    expect(opt.icon).toMatch(/^fa-[\w-]+$/)
    expect(opt.label).toBeTruthy()
    expect(opt.bg).toMatch(HEX_COLOR)
    expect(opt.color).toMatch(HEX_COLOR)
  }
  const icons = options.map((o) => o.icon)
  const labels = options.map((o) => o.label)
  expect(new Set(icons).size).toBe(icons.length)
  expect(new Set(labels).size).toBe(labels.length)
}

describe('foodIconOptions', () => {
  it('is a non-empty list of valid nutrition-themed icons', () => {
    expect(foodIconOptions.length).toBeGreaterThanOrEqual(15)
    assertValidIconOptions(foodIconOptions)
  })

  it('covers macros, meals, and common food groups', () => {
    const icons = new Set(foodIconOptions.map((o) => o.icon))
    expect(icons.has('fa-utensils')).toBe(true)
    expect(icons.has('fa-dumbbell')).toBe(true)
    expect(icons.has('fa-wheat-awn')).toBe(true)
    expect(icons.has('fa-glass-water')).toBe(true)
    expect(icons.has('fa-egg')).toBe(true)
    expect(icons.has('fa-chart-pie')).toBe(true)
  })

  it('DEFAULT_ICON points at the first option', () => {
    expect(foodIconOptions[0].icon).toBe(DEFAULT_ICON)
  })

  it('exposes the default bg and color hex values', () => {
    expect(DEFAULT_ICON_BG).toMatch(HEX_COLOR)
    expect(DEFAULT_ICON_COLOR).toMatch(HEX_COLOR)
  })
})

describe('workoutIconOptions', () => {
  it('is a non-empty list of valid activity-themed icons', () => {
    expect(workoutIconOptions.length).toBeGreaterThanOrEqual(10)
    assertValidIconOptions(workoutIconOptions)
  })

  it('covers strength, cardio, and timed activities', () => {
    const icons = new Set(workoutIconOptions.map((o) => o.icon))
    expect(icons.has('fa-dumbbell')).toBe(true)
    expect(icons.has('fa-person-running')).toBe(true)
    expect(icons.has('fa-heart-pulse')).toBe(true)
    expect(icons.has('fa-stopwatch')).toBe(true)
  })
})