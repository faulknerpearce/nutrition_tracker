import { parseISODate, type DailyEnergySnapshot } from '@nutrition-tracker/shared'
import { useMemo } from 'react'

interface TrendsChartProps {
  rows: DailyEnergySnapshot[]
}

interface ChartSeries {
  key: 'intake' | 'output' | 'net'
  label: string
  color: string
  pick: (row: DailyEnergySnapshot) => number
}

const SERIES: ChartSeries[] = [
  { key: 'intake', label: 'Intake', color: '#ea580c', pick: (row) => row.intakeCalories },
  { key: 'output', label: 'Total output', color: '#0d9488', pick: (row) => row.totalOutput },
  { key: 'net', label: 'Net', color: '#134e4b', pick: (row) => row.net },
]

const CHART_WIDTH = 720
const CHART_HEIGHT = 240
const PADDING = { top: 16, right: 16, bottom: 36, left: 48 }

function formatShortDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function niceAxisMax(value: number): number {
  if (value <= 0) return 100
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

function buildYAxisTicks(min: number, max: number): number[] {
  const span = max - min
  if (span <= 0) return [min, max]
  const step = niceAxisMax(Math.ceil(span / 4))
  const ticks: number[] = []
  const start = Math.floor(min / step) * step
  for (let value = start; value <= max + step * 0.01; value += step) {
    ticks.push(Math.round(value))
  }
  return ticks.length > 0 ? ticks : [min, max]
}

export default function TrendsChart({ rows }: TrendsChartProps) {
  const chart = useMemo(() => {
    if (rows.length === 0) return null

    const values = rows.flatMap((row) => [
      row.intakeCalories,
      row.totalOutput,
      row.net,
    ])
    const rawMin = Math.min(...values, 0)
    const rawMax = Math.max(...values, 0)
    const paddedMin = rawMin < 0 ? -niceAxisMax(Math.abs(rawMin)) : 0
    const paddedMax = niceAxisMax(rawMax * 1.1)
    const yMin = paddedMin
    const yMax = Math.max(paddedMax, 100)
    const yTicks = buildYAxisTicks(yMin, yMax)

    const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
    const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
    const xStep = rows.length > 1 ? plotWidth / (rows.length - 1) : 0

    const scaleY = (value: number) => {
      const ratio = (value - yMin) / (yMax - yMin)
      return PADDING.top + plotHeight - ratio * plotHeight
    }

    const scaleX = (index: number) => PADDING.left + index * xStep

    const zeroY = scaleY(0)
    const labelStride = rows.length > 14 ? Math.ceil(rows.length / 7) : rows.length > 7 ? 2 : 1

    const paths = SERIES.map((series) => {
      const points = rows.map((row, index) => ({
        x: scaleX(index),
        y: scaleY(series.pick(row)),
      }))
      const line = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ')
      return { series, points, line }
    })

    return { yMin, yMax, yTicks, paths, zeroY, labelStride, scaleX, scaleY }
  }, [rows])

  if (!chart || rows.length === 0) {
    return (
      <p style={{ color: '#a1a1aa', fontSize: 13, margin: 0 }}>
        No trend data for this period.
      </p>
    )
  }

  return (
    <div>
      <div
        role="img"
        aria-label="Line chart of daily intake, total output, and net calories"
        style={{ overflowX: 'auto' }}
      >
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          style={{ width: '100%', minWidth: 320, height: 'auto', display: 'block' }}
        >
          {chart.yTicks.map((tick) => {
            const y = chart.scaleY(tick)
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke={tick === 0 ? '#d4d4d8' : '#f4f4f5'}
                  strokeWidth={tick === 0 ? 1.5 : 1}
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#71717a"
                >
                  {tick.toLocaleString()}
                </text>
              </g>
            )
          })}

          {chart.paths.map(({ series, points, line }) => (
            <g key={series.key}>
              <path
                d={line}
                fill="none"
                stroke={series.color}
                strokeWidth={series.key === 'net' ? 3 : 2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((point, index) => (
                <circle
                  key={`${series.key}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={series.key === 'net' ? 4 : 3}
                  fill={series.color}
                >
                  <title>
                    {`${formatShortDate(rows[index].date)} ${series.label}: ${series.pick(rows[index]).toLocaleString()} kcal`}
                  </title>
                </circle>
              ))}
            </g>
          ))}

          {rows.map((row, index) =>
            index % chart.labelStride === 0 || index === rows.length - 1 ? (
              <text
                key={row.date}
                x={chart.scaleX(index)}
                y={CHART_HEIGHT - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#71717a"
              >
                {formatShortDate(row.date)}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginTop: 12,
          fontSize: 12,
          color: '#52525b',
        }}
      >
        {SERIES.map((series) => (
          <span key={series.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 14,
                height: 3,
                borderRadius: 9999,
                background: series.color,
              }}
            />
            {series.label}
          </span>
        ))}
      </div>
    </div>
  )
}