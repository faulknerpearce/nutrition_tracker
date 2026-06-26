import { formatDayLabel, shiftISODate, sumTotals, todayISO } from '@nutrition-tracker/shared'
import { useEffect, useMemo, useState } from 'react'
import { useNutritionGoals } from '../context/useProfile'
import AddEntryModal from '../components/AddEntryModal'
import BarcodeScannerModal from '../components/BarcodeScannerModal'
import CollapsiblePanel from '../components/layout/CollapsiblePanel'
import DayNavigator from '../components/layout/DayNavigator'
import ZoneButton from '../components/layout/ZoneButton'
import { PageError, PageLoading } from '../components/layout/PageState'
import FoodLogEntryStats from '../components/FoodLogEntryStats'
import FoodLogSection from '../components/FoodLogSection'
import MetricCard from '../components/MetricCard'
import type { MappedBarcodeProduct } from '../lib/openFoodFacts'
import {
  addEntry,
  deleteEntry,
  fetchDaySummaries,
  fetchEntries,
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

function emptyDaySummary(date: string): DaySummary {
  return { date, entries: [], totals: sumTotals([]) }
}

export default function InputsPage() {
  const nutritionGoals = useNutritionGoals()
  const [days, setDays] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [showAddForm, setShowAddForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [prefillEntry, setPrefillEntry] = useState<NewFoodEntry | null>(null)

  const today = todayISO()
  const isToday = selectedDate === today

  const activeDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? emptyDaySummary(selectedDate),
    [days, selectedDate],
  )

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

  useEffect(() => {
    if (loading) return
    if (days.some((day) => day.date === selectedDate)) return

    let cancelled = false
    fetchEntries(selectedDate)
      .then((entries) => {
        if (cancelled) return
        setDays((prev) => {
          if (prev.some((day) => day.date === selectedDate)) return prev
          return [...prev, { date: selectedDate, entries, totals: sumTotals(entries) }].sort(
            (a, b) => b.date.localeCompare(a.date),
          )
        })
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load food log for', selectedDate, err)
        }
      })

    return () => {
      cancelled = true
    }
  }, [loading, selectedDate, days])

  function openAddEntry() {
    setSelectedDate(today)
    setPrefillEntry(null)
    setShowAddForm(true)
  }

  function openBarcodeScanner() {
    setSelectedDate(today)
    setShowScanner(true)
  }

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
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayEntries(prev, today, [entry, ...existing.entries])
      }
      return [{ date: today, entries: [entry], totals: sumTotals([entry]) }, ...prev]
    })
    setSelectedDate(today)
  }

  async function persistLogRecipe(recipeId: string, servings: number) {
    const entry = await logRecipe({ recipeId, servings })
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayEntries(prev, today, [entry, ...existing.entries])
      }
      return [{ date: today, entries: [entry], totals: sumTotals([entry]) }, ...prev]
    })
    setSelectedDate(today)
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
    <>
      <DayNavigator
        date={selectedDate}
        itemCount={activeDay.entries.length}
        canGoForward={selectedDate < today}
        onPrevious={() => setSelectedDate((date) => shiftISODate(date, -1))}
        onNext={() => setSelectedDate((date) => shiftISODate(date, 1))}
      />

      <div className="inputs-quick-actions">
        <ZoneButton variant="primary" onClick={openAddEntry}>
          <i className="fa-solid fa-plus" aria-hidden="true" /> Add Entry
        </ZoneButton>
        <ZoneButton variant="secondary" onClick={openBarcodeScanner}>
          <i className="fa-solid fa-barcode" aria-hidden="true" /> Scan Barcode
        </ZoneButton>
      </div>

      <div className={`inputs-day-content${isToday ? ' inputs-day-content-today' : ''}`}>
        <CollapsiblePanel
          title="Nutrition Stats"
          subtitle={`Goal progress and entry insights for ${formatDayLabel(selectedDate).toLowerCase()}`}
        >
          <div className="metric-grid-2" style={{ paddingTop: 20 }}>
            {buildMetricConfigs(activeDay.entries, nutritionGoals).map((metric) => (
              <MetricCard key={metric.label} config={metric} />
            ))}
          </div>
          <FoodLogEntryStats entries={activeDay.entries} />
        </CollapsiblePanel>

        <CollapsiblePanel
          title={`${formatDayLabel(selectedDate)} Food Log`}
          subtitle={
            isToday
              ? 'Add, edit, or remove entries for today'
              : 'Edit or remove entries from this day'
          }
        >
          <FoodLogSection
            entries={activeDay.entries}
            onAdd={isToday ? persistAdd : undefined}
            onLogRecipe={isToday ? persistLogRecipe : undefined}
            onEdit={persistUpdate}
            onDelete={persistDelete}
            collapsible={false}
            showActions={false}
            showEntryStats={false}
          />
        </CollapsiblePanel>
      </div>

      {showScanner && (
        <BarcodeScannerModal
          onProductFound={(product: MappedBarcodeProduct) => {
            setPrefillEntry(product.entry)
            setShowScanner(false)
            setShowAddForm(true)
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
      {showAddForm && (
        <AddEntryModal
          prefill={prefillEntry ?? undefined}
          onAdd={persistAdd}
          onLogRecipe={persistLogRecipe}
          onClose={() => {
            setShowAddForm(false)
            setPrefillEntry(null)
          }}
        />
      )}
    </>
  )
}