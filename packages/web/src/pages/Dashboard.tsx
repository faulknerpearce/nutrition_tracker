import {
  computeNetBalance,
  formatDuration,
  sumActivityTotals,
  sumTotals,
  todayISO,
} from '@nutrition-tracker/shared'
import { useEffect, useState } from 'react'
import { useNutritionGoals } from '../context/useProfile'
import { pageTitle, sectionHeader as sectionLabelStyle } from '../lib/styles'
import ActivityMetricCard from '../components/ActivityMetricCard'
import DashboardPreviewList, { PreviewEmpty, PreviewRow } from '../components/DashboardPreviewList'
import MetricCard from '../components/MetricCard'
import NetBalanceCard from '../components/NetBalanceCard'
import { fetchActivities, type Activity } from '../lib/activities'
import { type FoodEntry, fetchEntries } from '../lib/entries'
import { buildActivityMetricConfigs } from '../lib/activityMetrics'
import { buildMetricConfigs } from '../lib/metrics'
import { routeHref } from '../lib/routing'

function formatRange(low: number, high: number, unit: string): string {
  return `${low.toLocaleString()}–${high.toLocaleString()} ${unit}`
}

function formatCaffeineLimit(limit: number, unit: string): string {
  return `≤${limit.toLocaleString()} ${unit}`
}

function SectionHeader({
  label,
  title,
  href,
  linkLabel,
}: {
  label: string
  title: string
  href: string
  linkLabel: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
      }}
    >
      <div>
        <p style={sectionLabelStyle}>{label}</p>
        <h3
          style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 24,
            margin: 0,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>
      </div>
      <a
        href={href}
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#134e4b',
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        {linkLabel} →
      </a>
    </div>
  )
}

export default function Dashboard() {
  const nutritionGoals = useNutritionGoals()
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchEntries(), fetchActivities()])
      .then(([food, acts]) => {
        setEntries(food)
        setActivities(acts)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        setLoading(false)
      })
  }, [])

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
        Loading dashboard...
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
        <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Failed to load dashboard</p>
        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{error}</p>
        <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 16 }}>
          Check that you are signed in and Supabase is reachable.
        </p>
      </div>
    )
  }

  const foodTotals = sumTotals(entries)
  const activityTotals = sumActivityTotals(activities)
  const balance = computeNetBalance(
    foodTotals.calories,
    activityTotals.calories,
    nutritionGoals.calories.low,
    nutritionGoals.calories.high,
  )
  const inputMetrics = buildMetricConfigs(entries, nutritionGoals)
  const outputMetrics = buildActivityMetricConfigs(activities)
  const recentEntries = [...entries].slice(-3).reverse()
  const recentActivities = [...activities].slice(-3).reverse()

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabelStyle}>Overview</p>
        <h2 className="page-title-mobile" style={pageTitle}>
          Dashboard
        </h2>
        <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
          {todayISO()} · Target:{' '}
          {formatRange(nutritionGoals.calories.low, nutritionGoals.calories.high, 'kcal')} •{' '}
          {formatRange(nutritionGoals.protein.low, nutritionGoals.protein.high, 'g protein')} • ~
          {nutritionGoals.carbs.value}g carbs • ~{nutritionGoals.fat.value}g fat • ~
          {nutritionGoals.fiber.value}g fiber •{' '}
          {formatCaffeineLimit(nutritionGoals.caffeine.value, 'mg caffeine')}
        </p>
      </div>

      <NetBalanceCard balance={balance} hasActivities={activities.length > 0} />

      <section style={{ marginBottom: 40 }}>
        <SectionHeader
          label="Nutrition"
          title="Today's Inputs"
          href={routeHref('inputs')}
          linkLabel="View Inputs"
        />
        <div className="metric-grid-2">
          {inputMetrics.map((m) => (
            <MetricCard key={m.label} config={m} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <SectionHeader
          label="Activity"
          title="Today's Outputs"
          href={routeHref('outputs')}
          linkLabel="View Outputs"
        />
        {activities.length === 0 ? (
          <div
            style={{
              background: 'white',
              border: '1px solid #e4e4e7',
              borderRadius: 24,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <p style={{ fontWeight: 500, color: '#52525b', margin: '0 0 4px 0' }}>
              No activities logged today
            </p>
            <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0 }}>
              <a href={routeHref('outputs')} style={{ color: '#134e4b', fontWeight: 500 }}>
                Log an activity
              </a>{' '}
              to track workouts and calories burned.
            </p>
          </div>
        ) : (
          <div className="metric-grid-2">
            {outputMetrics.map((metric) => (
              <ActivityMetricCard key={metric.label} config={metric} />
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader
          label="Logs"
          title="Today's Logs"
          href={routeHref('inputs')}
          linkLabel="View all"
        />
        <div className="metric-grid-auto">
          <DashboardPreviewList
            title="Recent Food"
            viewAllHref={routeHref('inputs')}
            viewAllLabel="Inputs"
          >
            {recentEntries.length === 0 ? (
              <PreviewEmpty message="No food logged today" />
            ) : (
              recentEntries.map((entry) => (
                <PreviewRow
                  key={entry.id}
                  primary={entry.name}
                  secondary={entry.description || 'Food entry'}
                  meta={`${entry.calories} kcal · ${entry.protein}g protein`}
                />
              ))
            )}
          </DashboardPreviewList>

          <DashboardPreviewList
            title="Recent Activities"
            viewAllHref={routeHref('outputs')}
            viewAllLabel="Outputs"
          >
            {recentActivities.length === 0 ? (
              <PreviewEmpty message="No activities logged today" />
            ) : (
              recentActivities.map((activity) => (
                <PreviewRow
                  key={activity.id}
                  primary={activity.name}
                  secondary={activity.activityType}
                  meta={formatDuration(activity.movingTimeSeconds)}
                />
              ))
            )}
          </DashboardPreviewList>
        </div>
      </section>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: '#a1a1aa' }}>
          Data is estimated using standard nutritional references. Actual values may vary.
        </p>
      </div>
    </div>
  )
}
