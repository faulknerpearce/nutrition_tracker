import type { Activity, NutritionGoals } from '@nutrition-tracker/shared'
import { buildActivityBarData } from '../../lib/dashboardCharts'
import { buildActivityMetricConfigs } from '../../lib/activityMetrics'
import { cardSurface, subtleSurface } from '../../lib/styles'
import { routeHref } from '../../lib/routing'
import HorizontalBarChart from '../charts/HorizontalBarChart'

interface ActivityOverviewPanelProps {
  activities: readonly Activity[]
  goals: NutritionGoals
}

export default function ActivityOverviewPanel({ activities, goals }: ActivityOverviewPanelProps) {
  if (activities.length === 0) {
    return (
      <div
        style={{
          ...cardSurface,
          padding: 24,
          textAlign: 'center',
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
    )
  }

  const barRows = buildActivityBarData(activities, goals.calories.value)
  const metricConfigs = buildActivityMetricConfigs(activities)

  return (
    <div style={{ ...cardSurface, padding: 28 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {metricConfigs.map((metric) => (
          <div
            key={metric.label}
            style={{
              ...subtleSurface,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 500, color: '#71717a', marginBottom: 4 }}>
              {metric.label}
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: metric.color,
                lineHeight: 1.1,
              }}
            >
              {metric.value}
            </div>
            <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{metric.detail}</div>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#71717a',
          textTransform: 'uppercase',
          margin: '0 0 16px 0',
        }}
      >
        Activity breakdown
      </p>
      <HorizontalBarChart rows={barRows} />
    </div>
  )
}