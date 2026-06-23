import { useEffect, useState } from 'react'
import FoodLogSection from '../components/FoodLogSection'
import MetricCard, { type MetricConfig } from '../components/MetricCard'
import {
  type FoodEntry,
  fetchEntries,
  addEntry,
  deleteEntry,
  sumTotals,
  calGoal,
  proGoal,
  carbGoal,
  caffeineGoal,
  goals,
} from '../lib/entries'

function formatRange(low: number, high: number, unit: string): string {
  return `${low.toLocaleString()}–${high.toLocaleString()} ${unit}`
}

function formatCaffeineLimit(limit: number, unit: string): string {
  return `≤${limit.toLocaleString()} ${unit}`
}

const fmtInt = (n: number) => n.toLocaleString()

export default function Dashboard() {
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEntries()
      .then((data) => {
        setEntries(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load')
        setLoading(false)
      })
  }, [])

  async function persistAdd(input: Omit<FoodEntry, 'id'>) {
    const entry = await addEntry(input)
    setEntries((prev) => [...prev, entry])
  }

  async function persistDelete(id: string) {
    await deleteEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{ textAlign: 'center', padding: '80px 20px', color: '#a1a1aa' }}
      >
        <i
          className="fa-solid fa-spinner fa-spin"
          style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
        />
        Loading entries...
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: '80px 20px', color: '#dc2626' }}>
        <i
          className="fa-solid fa-circle-exclamation"
          style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
        />
        <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Failed to load entries</p>
        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{error}</p>
        <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 16 }}>
          Check that you are signed in and Supabase is reachable.
        </p>
      </div>
    )
  }

  const totals = sumTotals(entries)

  const metrics: MetricConfig[] = [
    {
      label: 'Calories',
      value: totals.calories,
      formatValue: fmtInt,
      unit: null,
      goal: calGoal,
      formatGoal: fmtInt,
      color: '#ea580c',
      iconBg: '#fed7aa',
      iconClass: 'fa-fire',
      gradient: 'linear-gradient(to right, #134e4b, #14b8a6)',
      rightLabel: 'of daily goal',
      remainingSuffix: 'kcal',
      remaining: (v, g) => `${Math.max(g - v, 0).toLocaleString()} kcal`,
    },
    {
      label: 'Protein',
      value: totals.protein,
      formatValue: (n) => `${n}`,
      unit: 'g',
      goal: proGoal,
      formatGoal: (n) => `${n}`,
      color: '#059669',
      iconBg: '#d1fae5',
      iconClass: 'fa-dumbbell',
      gradient: 'linear-gradient(to right, #059669, #14b8a6)',
      rightLabel: 'of daily goal',
      remainingSuffix: 'g',
      remaining: (v, g) => `${Math.max(g - v, 0)} g`,
    },
    {
      label: 'Carbs',
      value: totals.carbs,
      formatValue: (n) => `${n}`,
      unit: 'g',
      goal: carbGoal,
      formatGoal: (n) => `${n}`,
      color: '#d97706',
      iconBg: '#fef3c7',
      iconClass: 'fa-wheat-awn',
      gradient: 'linear-gradient(to right, #d97706, #fbbf24)',
      rightLabel: 'of daily goal',
      remainingSuffix: 'g',
      remaining: (v, g) => `${Math.max(g - v, 0)} g`,
    },
    {
      label: 'Caffeine',
      value: totals.caffeine,
      formatValue: (n) => `${n}`,
      unit: 'mg',
      goal: caffeineGoal,
      formatGoal: (n) => `${n}`,
      color: '#7c3aed',
      iconBg: '#ede9fe',
      iconClass: 'fa-mug-hot',
      gradient: 'linear-gradient(to right, #7c3aed, #a78bfa)',
      rightLabel: 'of daily limit',
      remainingSuffix: 'mg',
      remaining: (v, g) => `${Math.max(g - v, 0)} mg`,
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 16 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '1.5px',
              color: '#134e4b',
              textTransform: 'uppercase',
              margin: '0 0 4px 0',
            }}
          >
            Overview
          </p>
          <h2
            style={{
              fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
              fontSize: 36,
              margin: 0,
              fontWeight: 600,
              letterSpacing: '-0.03em',
            }}
          >
            Today's Intake
          </h2>
          <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
            Target: {formatRange(goals.calories.low, goals.calories.high, 'kcal')} •{' '}
            {formatRange(goals.protein.low, goals.protein.high, 'g protein')} • ~{goals.carbs.value}
            g carbs • {formatCaffeineLimit(goals.caffeine.value, 'mg caffeine')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {metrics.map((m) => (
            <MetricCard key={m.label} config={m} />
          ))}
        </div>
      </div>

      <FoodLogSection entries={entries} onAdd={persistAdd} onDelete={persistDelete} />

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: '#a1a1aa' }}>
          Data is estimated using standard nutritional references. Actual values may vary.
        </p>
      </div>
    </div>
  )
}
