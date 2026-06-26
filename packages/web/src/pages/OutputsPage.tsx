import {
  formatDayLabel,
  formatDistance,
  formatDuration,
  shiftISODate,
  sumActivityTotals,
  todayISO,
} from '@nutrition-tracker/shared'
import { useEffect, useMemo, useState } from 'react'
import AddActivityModal from '../components/AddActivityModal'
import ActivityLogSection from '../components/ActivityLogSection'
import ActivityMetricCard from '../components/ActivityMetricCard'
import CollapsiblePanel from '../components/layout/CollapsiblePanel'
import DayNavigator from '../components/layout/DayNavigator'
import ZoneButton from '../components/layout/ZoneButton'
import { PageError, PageLoading } from '../components/layout/PageState'
import { buildActivityMetricConfigs } from '../lib/activityMetrics'
import {
  addActivity,
  deleteActivity,
  fetchActivities,
  fetchActivityDaySummaries,
  updateActivity,
  type Activity,
  type ActivityDaySummary,
  type NewActivity,
} from '../lib/activities'
import { logWorkout } from '../lib/workouts'

function updateDayActivities(
  days: ActivityDaySummary[],
  date: string,
  activities: Activity[],
): ActivityDaySummary[] {
  return days.map((day) =>
    day.date === date ? { ...day, activities, totals: sumActivityTotals(activities) } : day,
  )
}

function emptyDaySummary(date: string): ActivityDaySummary {
  return { date, activities: [], totals: sumActivityTotals([]) }
}

export default function OutputsPage() {
  const [days, setDays] = useState<ActivityDaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [showAddForm, setShowAddForm] = useState(false)

  const today = todayISO()
  const isToday = selectedDate === today

  const activeDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? emptyDaySummary(selectedDate),
    [days, selectedDate],
  )

  const dayMeta = useMemo(() => {
    const count = activeDay.activities.length
    const parts = [
      `${count} ${count === 1 ? 'activity' : 'activities'}`,
      formatDuration(activeDay.totals.movingTimeSeconds),
      formatDistance(activeDay.totals.distanceMeters || null),
    ]
    if (activeDay.totals.calories > 0) {
      parts.push(`${activeDay.totals.calories} kcal burned`)
    }
    return parts.join(' • ')
  }, [activeDay])

  useEffect(() => {
    fetchActivityDaySummaries()
      .then((data) => {
        setDays(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load activities')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (loading) return
    if (days.some((day) => day.date === selectedDate)) return

    let cancelled = false
    fetchActivities(selectedDate)
      .then((activities) => {
        if (cancelled) return
        setDays((prev) => {
          if (prev.some((day) => day.date === selectedDate)) return prev
          return [
            ...prev,
            { date: selectedDate, activities, totals: sumActivityTotals(activities) },
          ].sort((a, b) => b.date.localeCompare(a.date))
        })
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load activities for', selectedDate, err)
        }
      })

    return () => {
      cancelled = true
    }
  }, [loading, selectedDate, days])

  function openLogActivity() {
    setSelectedDate(today)
    setShowAddForm(true)
  }

  async function persistAdd(input: NewActivity) {
    const activity = await addActivity(input)
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayActivities(prev, today, [activity, ...existing.activities])
      }
      return [
        { date: today, activities: [activity], totals: sumActivityTotals([activity]) },
        ...prev,
      ]
    })
    setSelectedDate(today)
  }

  async function persistLogWorkout(options: { workoutId: string; setsLogged: number }) {
    const activity = await logWorkout(options)
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayActivities(prev, today, [activity, ...existing.activities])
      }
      return [
        { date: today, activities: [activity], totals: sumActivityTotals([activity]) },
        ...prev,
      ]
    })
    setSelectedDate(today)
  }

  async function persistUpdate(id: string, input: NewActivity) {
    const updated = await updateActivity(id, input)
    setDays((prev) =>
      prev.map((day) => {
        const activities = day.activities.map((activity) =>
          activity.id === id ? updated : activity,
        )
        return activities === day.activities
          ? day
          : { ...day, activities, totals: sumActivityTotals(activities) }
      }),
    )
  }

  async function persistDelete(id: string) {
    await deleteActivity(id)
    setDays((prev) =>
      prev.map((day) => {
        const activities = day.activities.filter((activity) => activity.id !== id)
        return activities.length === day.activities.length
          ? day
          : { ...day, activities, totals: sumActivityTotals(activities) }
      }),
    )
  }

  if (loading) return <PageLoading message="Loading activities..." />
  if (error) return <PageError message="Failed to load activities" detail={error} />

  return (
    <>
      <DayNavigator
        date={selectedDate}
        meta={dayMeta}
        canGoForward={selectedDate < today}
        onPrevious={() => setSelectedDate((date) => shiftISODate(date, -1))}
        onNext={() => setSelectedDate((date) => shiftISODate(date, 1))}
      />

      <div className="inputs-quick-actions">
        <ZoneButton variant="primary" onClick={openLogActivity}>
          <i className="fa-solid fa-plus" aria-hidden="true" /> Log Activity
        </ZoneButton>
      </div>

      <div className={`inputs-day-content${isToday ? ' inputs-day-content-today' : ''}`}>
        <CollapsiblePanel
          title="Activity Stats"
          subtitle={`Performance summary for ${formatDayLabel(selectedDate).toLowerCase()}`}
        >
          <div className="metric-grid-2" style={{ paddingTop: 20 }}>
            {buildActivityMetricConfigs(activeDay.activities).map((metric) => (
              <ActivityMetricCard key={metric.label} config={metric} />
            ))}
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title={`${formatDayLabel(selectedDate)} Activities`}
          subtitle={
            isToday
              ? 'Log, edit, or remove activities for today'
              : 'Edit or remove activities from this day'
          }
        >
          <ActivityLogSection
            activities={activeDay.activities}
            onAdd={isToday ? persistAdd : undefined}
            onLogWorkout={isToday ? persistLogWorkout : undefined}
            onEdit={persistUpdate}
            onDelete={persistDelete}
            collapsible={false}
            showActions={false}
          />
        </CollapsiblePanel>
      </div>

      {showAddForm && (
        <AddActivityModal
          onAdd={persistAdd}
          onLogWorkout={async (options) => {
            await persistLogWorkout(options)
            setShowAddForm(false)
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </>
  )
}