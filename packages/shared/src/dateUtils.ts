import type { ValidationResult } from './validation.js'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const DEFAULT_TIMEZONE = 'UTC'

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone })
    return true
  } catch {
    return false
  }
}

/** IANA timezone from the runtime environment (browser or Node). */
export function detectBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE
}

export function todayISO(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Calendar date in an IANA timezone (e.g. America/Los_Angeles). */
export function todayISOInTimeZone(timeZone: string, date: Date = new Date()): string {
  const tz = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  if (!y || !m || !d) return todayISO(date)
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Returns an ISO date string `days` before `from` (local calendar). */
export function offsetDateISO(days: number, from: Date = new Date()): string {
  const date = new Date(from)
  date.setDate(date.getDate() - days)
  return todayISO(date)
}

/** Shift an ISO date string by `deltaDays` on the local calendar. */
export function shiftISODate(iso: string, deltaDays: number): string {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + deltaDays)
  return todayISO(date)
}

function resolveTodayISO(options?: { now?: Date; timeZone?: string }): string {
  if (options?.timeZone) {
    return todayISOInTimeZone(options.timeZone, options.now)
  }
  return todayISO(options?.now)
}

export function parseLogDate(
  value: unknown,
  options?: { fallback?: string; allowFuture?: boolean; now?: Date; timeZone?: string },
): ValidationResult<string> {
  const fallback = options?.fallback ?? resolveTodayISO(options)
  const raw =
    typeof value === 'string' && value.trim() !== ''
      ? value.trim()
      : typeof fallback === 'string'
        ? fallback
        : undefined

  if (!raw) {
    return { ok: false, error: 'date is required (YYYY-MM-DD)' }
  }
  if (!ISO_DATE_RE.test(raw)) {
    return { ok: false, error: 'date must be YYYY-MM-DD' }
  }

  const [y, m, d] = raw.split('-').map(Number)
  const parsed = new Date(y, m - 1, d)
  if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) {
    return { ok: false, error: 'date is not a valid calendar day' }
  }

  if (!options?.allowFuture) {
    const today = resolveTodayISO(options)
    if (raw > today) {
      return { ok: false, error: 'date cannot be in the future' }
    }
  }

  return { ok: true, value: raw }
}

function timeZoneParts(iso: string, timeZone: string, includeMinute: boolean) {
  const tz = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: includeMinute ? '2-digit' : undefined,
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
}

/** Local hour (0–23) for an ISO timestamp in an IANA timezone. */
export function hourInTimeZone(iso: string, timeZone: string): number {
  const hour = timeZoneParts(iso, timeZone, false).find((part) => part.type === 'hour')?.value
  return hour ? parseInt(hour, 10) : 0
}

/** Local minute (0–59) for an ISO timestamp in an IANA timezone. */
export function minuteInTimeZone(iso: string, timeZone: string): number {
  const minute = timeZoneParts(iso, timeZone, true).find((part) => part.type === 'minute')?.value
  return minute ? parseInt(minute, 10) : 0
}

/** Calendar date (YYYY-MM-DD) for an ISO timestamp in an IANA timezone. */
export function dayInTimeZone(iso: string, timeZone: string): string {
  const tz = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  const y = parts.find((part) => part.type === 'year')?.value
  const m = parts.find((part) => part.type === 'month')?.value
  const d = parts.find((part) => part.type === 'day')?.value
  if (!y || !m || !d) return todayISO(new Date(iso))
  return `${y}-${m}-${d}`
}

/** Value for an HTML time input from an ISO timestamp in an IANA timezone. */
export function formatTimeInputValue(iso: string, timeZone: string): string {
  const hour = hourInTimeZone(iso, timeZone)
  const minute = minuteInTimeZone(iso, timeZone)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** Current local time as HH:MM for an HTML time input. */
export function currentTimeInputValue(timeZone: string, now: Date = new Date()): string {
  return formatTimeInputValue(now.toISOString(), timeZone)
}

/** Build an ISO timestamp for a calendar day and local time in an IANA timezone. */
export function loggedAtFromDayAndTime(
  entryDate: string,
  timeValue: string,
  timeZone: string,
): ValidationResult<string> {
  const trimmed = timeValue.trim()
  const match = /^(\d{2}):(\d{2})$/.exec(trimmed)
  if (!match) {
    return { ok: false, error: 'time must be HH:MM' }
  }

  const hour = Number.parseInt(match[1], 10)
  const minute = Number.parseInt(match[2], 10)
  if (hour > 23 || minute > 59) {
    return { ok: false, error: 'time is not valid' }
  }

  const [y, m, d] = entryDate.split('-').map(Number)
  let utcMs = Date.UTC(y, m - 1, d, hour, minute, 0, 0)

  for (let attempt = 0; attempt < 5; attempt++) {
    const iso = new Date(utcMs).toISOString()
    const zonedDay = dayInTimeZone(iso, timeZone)
    const zonedHour = hourInTimeZone(iso, timeZone)
    const zonedMinute = minuteInTimeZone(iso, timeZone)

    if (zonedDay === entryDate && zonedHour === hour && zonedMinute === minute) {
      return { ok: true, value: iso }
    }

    const dayOffset = zonedDay < entryDate ? 1 : zonedDay > entryDate ? -1 : 0
    const minuteOffset =
      hour * 60 + minute - (zonedHour * 60 + zonedMinute) + dayOffset * 24 * 60
    utcMs += minuteOffset * 60 * 1000
  }

  return { ok: false, error: 'could not resolve log time in your timezone' }
}

export function parseLoggedAt(value: unknown): ValidationResult<string> {
  if (typeof value !== 'string' || value.trim() === '') {
    return { ok: false, error: 'loggedAt must be an ISO timestamp' }
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: 'loggedAt must be an ISO timestamp' }
  }
  return { ok: true, value: parsed.toISOString() }
}

/** Local log time for charting, e.g. "8:15 AM". */
export function formatLogTime(iso: string, timeZone: string): string {
  const tz = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const today = todayISO(now)
  const yesterday = offsetDateISO(1, now)
  if (iso === today) return 'Today'
  if (iso === yesterday) return 'Yesterday'
  return parseISODate(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

/** Headline weekday label: Today, Yesterday, or weekday name only. */
export function formatWeekdayHeadline(iso: string, now: Date = new Date()): string {
  const today = todayISO(now)
  const yesterday = offsetDateISO(1, now)
  if (iso === today) return 'Today'
  if (iso === yesterday) return 'Yesterday'
  return parseISODate(iso).toLocaleDateString('en-US', { weekday: 'long' })
}

/** Calendar date without year, e.g. "June 27". */
export function formatMonthDayLabel(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
}
