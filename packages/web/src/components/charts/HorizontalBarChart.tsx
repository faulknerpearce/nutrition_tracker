import type { ActivityBarRow } from '../../lib/dashboardCharts'

export type BarChartRow = Pick<
  ActivityBarRow,
  'label' | 'value' | 'displayValue' | 'max' | 'color' | 'gradient'
>

interface HorizontalBarChartProps {
  rows: readonly BarChartRow[]
}

const BAR_TRANSITION = 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'

function BarRow({ row }: { row: BarChartRow }) {
  const pct = row.max > 0 ? Math.min((row.value / row.max) * 100, 100) : 0

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>{row.label}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#3f3f46',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {row.displayValue}
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 9999,
          background: '#f4f4f5',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 9999,
            background: row.gradient,
            boxShadow: `0 0 8px ${row.color}33`,
            transition: BAR_TRANSITION,
          }}
        />
      </div>
    </div>
  )
}

export default function HorizontalBarChart({ rows }: HorizontalBarChartProps) {
  return (
    <div role="img" aria-label="Bar chart">
      {rows.map((row) => (
        <BarRow key={row.label} row={row} />
      ))}
    </div>
  )
}