import { describe, expect, it } from 'vitest'
import {
  formatDayLabel,
  offsetDateISO,
  parseISODate,
  shiftISODate,
  parseLogDate,
  todayISO,
  todayISOInTimeZone,
} from '../dateUtils.js'

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

describe('parseISODate', () => {
  it('parses YYYY-MM-DD into a local Date', () => {
    const date = parseISODate('2026-06-22')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(5)
    expect(date.getDate()).toBe(22)
  })
})

describe('offsetDateISO', () => {
  it('returns an ISO date N days before the reference date', () => {
    const ref = new Date(2026, 5, 23)
    expect(offsetDateISO(1, ref)).toBe('2026-06-22')
    expect(offsetDateISO(30, ref)).toBe('2026-05-24')
  })
})

describe('shiftISODate', () => {
  it('shifts an ISO date by the given number of days', () => {
    expect(shiftISODate('2026-06-23', -1)).toBe('2026-06-22')
    expect(shiftISODate('2026-06-23', 1)).toBe('2026-06-24')
    expect(shiftISODate('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('todayISOInTimeZone', () => {
  it('returns the calendar date in the given IANA timezone', () => {
    const eveningUtc = new Date('2026-06-24T02:30:00Z')
    expect(todayISOInTimeZone('America/Los_Angeles', eveningUtc)).toBe('2026-06-23')
    expect(todayISOInTimeZone('UTC', eveningUtc)).toBe('2026-06-24')
  })
})

describe('parseLogDate', () => {
  const now = new Date(2026, 5, 23)

  it('accepts a valid past or present ISO date', () => {
    expect(parseLogDate('2026-06-22', { now })).toEqual({ ok: true, value: '2026-06-22' })
    expect(parseLogDate('2026-06-23', { now })).toEqual({ ok: true, value: '2026-06-23' })
  })

  it('uses fallback when value is missing', () => {
    expect(parseLogDate(undefined, { fallback: '2026-06-20', now })).toEqual({
      ok: true,
      value: '2026-06-20',
    })
  })

  it('defaults fallback to today in the provided timezone', () => {
    const eveningUtc = new Date('2026-06-24T02:30:00Z')
    expect(parseLogDate(undefined, { timeZone: 'America/Los_Angeles', now: eveningUtc })).toEqual({
      ok: true,
      value: '2026-06-23',
    })
  })

  it('rejects invalid and future dates', () => {
    expect(parseLogDate('2026-13-01', { now }).ok).toBe(false)
    expect(parseLogDate('06-23-2026', { now }).ok).toBe(false)
    expect(parseLogDate('2026-06-24', { now })).toEqual({
      ok: false,
      error: 'date cannot be in the future',
    })
  })

  it('rejects future dates relative to the user timezone', () => {
    const eveningUtc = new Date('2026-06-24T02:30:00Z')
    expect(parseLogDate('2026-06-24', { timeZone: 'America/Los_Angeles', now: eveningUtc })).toEqual({
      ok: false,
      error: 'date cannot be in the future',
    })
  })
})

describe('formatDayLabel', () => {
  const now = new Date(2026, 5, 23)

  it('labels today and yesterday relative to now', () => {
    expect(formatDayLabel('2026-06-23', now)).toBe('Today')
    expect(formatDayLabel('2026-06-22', now)).toBe('Yesterday')
  })

  it('formats other dates with weekday and month', () => {
    expect(formatDayLabel('2026-06-15', now)).toBe('Monday, Jun 15')
  })
})
