import { describe, expect, it } from 'vitest'
import { todayISO } from '../dateUtils.js'

describe('todayISO', () => {
  it('formats a date as YYYY-MM-DD using local components', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(todayISO(new Date(2026, 11, 31))).toBe('2026-12-31')
    expect(todayISO(new Date(2026, 8, 9))).toBe('2026-09-09')
  })

  it('zero-pads single-digit months and days', () => {
    expect(todayISO(new Date(2026, 0, 1))).toBe('2026-01-01')
    expect(todayISO(new Date(2026, 8, 1))).toBe('2026-09-01')
  })

  it('uses the local date (not UTC)', () => {
    const localMidnight = new Date(2026, 5, 22, 0, 0, 0)
    expect(todayISO(localMidnight)).toBe('2026-06-22')
  })
})
