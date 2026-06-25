import { formatDayLabel, sumTotals, todayISO } from '@nutrition-tracker/shared'
import { useEffect, useState } from 'react'
import { useNutritionGoals } from '../context/useProfile'
import { PageError, PageLoading } from '../components/layout/PageState'
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
    options?: { saveAsRecipe?: boolean; perServing?: NewFoodEntry },
  ) {
    const entry = await addEntry(input)
    if (options?.saveAsRecipe) {
      const recipeSource = options.perServing ?? input
      await saveRecipe({
        name: recipeSource.name,
        description: recipeSource.description,
        icon: recipeSource.icon,
        iconBg: recipeSource.iconBg,
        iconColor: recipeSource.iconColor,
        defaultServings: 1,
        ingredients: [
          {
            name: recipeSource.name,
            amount: '',
            sortOrder: 0,
            calories: recipeSource.calories,
            protein: recipeSource.protein,
            carbs: recipeSource.carbs,
            fat: recipeSource.fat,
            fiber: recipeSource.fiber,
            caffeine: recipeSource.caffeine,
          },
        ],
      })
    }
    const today = todayISO()
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayEntries(prev, today, [entry, ...existing.entries])
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
        return updateDayEntries(prev, today, [entry, ...existing.entries])
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

  if (loading) return <PageLoading message="Loading food logs..." />
  if (error) return <PageError message="Failed to load food logs" detail={error} />

  return (
    <div className="catalog-list">
      {days.map((day) => {
        const expanded = expandedDate === day.date
        const isToday = day.date === todayISO()

        return (
          <div
            key={day.date}
            className={isToday ? 'day-accordion day-accordion-today' : 'day-accordion'}
          >
            <button
              type="button"
              className="day-accordion-toggle"
              onClick={() => setExpandedDate(expanded ? null : day.date)}
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
  )
}
