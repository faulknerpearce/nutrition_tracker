import { formatDayLabel, sumTotals, todayISO } from '@nutrition-tracker/shared'
import { useEffect, useState } from 'react'
import { useNutritionGoals } from '../context/useProfile'
import { pageTitle, sectionHeader as sectionLabelStyle } from '../lib/styles'
import FoodLogSection from '../components/FoodLogSection'
import MetricCard from '../components/MetricCard'
import {
  addEntry,
  deleteEntry,
  fetchDaySummaries,
  updateEntry,
  type DaySummary,
  type FoodEntry,
  type NewFoodEntry,
} from '../lib/entries'
import { logRecipe, saveRecipe } from '../lib/recipes'
import { buildMetricConfigs } from '../lib/metrics'

function updateDayEntries(days: DaySummary[], date: string, entries: FoodEntry[]): DaySummary[] {
  return days.map((day) =>
    day.date === date ? { ...day, entries, totals: sumTotals(entries) } : day,
  )
}

export default function InputsPage() {
  const nutritionGoals = useNutritionGoals()
  const [days, setDays] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDate, setExpandedDate] = useState<string | null>(todayISO())

  useEffect(() => {
    fetchDaySummaries()
      .then((data) => {
        setDays(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load food logs')
        setLoading(false)
      })
  }, [])

  async function persistAdd(
    input: NewFoodEntry,
    options?: { saveAsRecipe?: boolean },
  ) {
    const entry = await addEntry(input)
    if (options?.saveAsRecipe) {
      await saveRecipe({
        name: input.name,
        description: input.description,
        icon: input.icon,
        iconBg: input.iconBg,
        iconColor: input.iconColor,
        defaultServings: 1,
        ingredients: [
          {
            name: input.name,
            amount: '',
            sortOrder: 0,
            calories: input.calories,
            protein: input.protein,
            carbs: input.carbs,
            fat: input.fat,
            fiber: input.fiber,
            caffeine: input.caffeine,
          },
        ],
      })
    }
    const today = todayISO()
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayEntries(prev, today, [...existing.entries, entry])
      }
      return [{ date: today, entries: [entry], totals: sumTotals([entry]) }, ...prev]
    })
  }

  async function persistLogRecipe(recipeId: string, servings: number) {
    const entry = await logRecipe({ recipeId, servings })
    const today = todayISO()
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayEntries(prev, today, [...existing.entries, entry])
      }
      return [{ date: today, entries: [entry], totals: sumTotals([entry]) }, ...prev]
    })
  }

  async function persistUpdate(id: string, input: NewFoodEntry) {
    const updated = await updateEntry(id, input)
    setDays((prev) =>
      prev.map((day) => {
        const entries = day.entries.map((entry) => (entry.id === id ? updated : entry))
        return entries === day.entries ? day : { ...day, entries, totals: sumTotals(entries) }
      }),
    )
  }

  async function persistDelete(id: string) {
    await deleteEntry(id)
    setDays((prev) =>
      prev.map((day) => {
        const entries = day.entries.filter((entry) => entry.id !== id)
        return entries.length === day.entries.length
          ? day
          : { ...day, entries, totals: sumTotals(entries) }
      }),
    )
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
        Loading food logs...
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
        <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Failed to load food logs</p>
        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabelStyle}>Food Logs</p>
        <h2 className="page-title-mobile" style={pageTitle}>
          Inputs
        </h2>
        <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
          Expand a day to view, add, or edit its food log entries.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {days.map((day) => {
          const expanded = expandedDate === day.date
          const isToday = day.date === todayISO()

          return (
            <div
              key={day.date}
              style={{
                background: 'white',
                border: '1px solid #e4e4e7',
                borderRadius: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedDate(expanded ? null : day.date)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '20px 24px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                    {formatDayLabel(day.date)}
                  </div>
                  <div style={{ fontSize: 12, color: '#71717a' }}>{day.date}</div>
                  <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>
                    {day.entries.length} {day.entries.length === 1 ? 'entry' : 'entries'}
                  </div>
                </div>
                <i
                  className="fa-solid fa-chevron-down"
                  style={{
                    color: '#71717a',
                    fontSize: 14,
                    transition: 'transform 0.2s ease',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {expanded && (
                <div
                  className="log-section-content"
                  style={{ padding: '0 24px 24px', borderTop: '1px solid #f4f4f5' }}
                >
                  <div className="metric-grid-2" style={{ paddingTop: 20, marginBottom: 24 }}>
                    {buildMetricConfigs(day.entries, nutritionGoals).map((m) => (
                      <MetricCard key={m.label} config={m} />
                    ))}
                  </div>
                  <FoodLogSection
                    entries={day.entries}
                    onAdd={isToday ? persistAdd : undefined}
                    onLogRecipe={isToday ? persistLogRecipe : undefined}
                    onEdit={persistUpdate}
                    onDelete={persistDelete}
                    title={`${formatDayLabel(day.date)} Food Log`}
                    subtitle={
                      isToday
                        ? 'Add, edit, or remove entries for today'
                        : 'Edit or remove entries from this day'
                    }
                    defaultExpanded
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
