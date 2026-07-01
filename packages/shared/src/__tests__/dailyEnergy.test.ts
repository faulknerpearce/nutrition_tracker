import { describe, expect, it } from 'vitest'
import {
  buildDailyEnergySnapshots,
  resolveTrendsDateRange,
  summarizeDailyEnergyPeriod,
} from '../dailyEnergy.js'

describe('buildDailyEnergySnapshots', () => {
  it('includes BMR in total output and computes net deltas', () => {
    const rows = buildDailyEnergySnapshots(
      '2026-06-01',
      '2026-06-03',
      {
        '2026-06-01': 2200,
        '2026-06-02': 2100,
        '2026-06-03': 2300,
      },
      {
        '2026-06-01': 300,
        '2026-06-02': 0,
        '2026-06-03': 450,
      },
      1400,
    )

    expect(rows).toHaveLength(3)
    expect(rows[0].totalOutput).toBe(1700)
    expect(rows[0].net).toBe(500)
    expect(rows[0].netDelta).toBeNull()
    expect(rows[1].netDelta).toBe(rows[1].net - rows[0].net)
    expect(rows.every((row) => row.totalOutput > 0)).toBe(true)
  })
})

describe('resolveTrendsDateRange', () => {
  it('resolves last 7 days inclusive', () => {
    expect(resolveTrendsDateRange('last_7', { today: '2026-06-30' })).toEqual({
      start: '2026-06-24',
      end: '2026-06-30',
    })
  })
})

describe('summarizeDailyEnergyPeriod', () => {
  it('returns totals and averages', () => {
    const rows = buildDailyEnergySnapshots('2026-06-01', '2026-06-02', {}, {}, 1400)
    const summary = summarizeDailyEnergyPeriod(rows)
    expect(summary.dayCount).toBe(2)
    expect(summary.bmrTotal).toBe(2800)
    expect(summary.totalOutputTotal).toBe(2800)
    expect(summary.netTotal).toBe(-2800)
  })
})