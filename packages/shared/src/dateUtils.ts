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
