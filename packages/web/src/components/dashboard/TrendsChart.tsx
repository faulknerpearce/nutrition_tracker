import { parseISODate, type DailyEnergySnapshot } from '@nutrition-tracker/shared'
import { useMemo } from 'react'
import { neutrals } from '../../lib/design-tokens'
import { useMediaQuery } from '../../lib/useMediaQuery'

interface TrendsChartProps {
  rows: DailyEnergySnapshot[]
}

interface ChartSeries {
  key: 'intake' | 'output' | 'net'
  label: string
  color: string
  pick: (row: DailyEnergySnapshot) => number
}

/** Golden-hour chart series (peach intake, teal output, sky-top net). */
const SERIES: ChartSeries[] = [
  { key: 'intake', label: 'Intake', color: '#E8893A', pick: (row) => row.intakeCalories },
  { key: 'output', label: 'Total output', color: '#2F8A9B', pick: (row) => row.totalOutput },
  { key: 'net', label: 'Net', color: '#3D4F7A', pick: (row) => row.net },
]

function formatShortDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCompactKcal(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1000) {
    const k = value / 1000
    const rounded = Math.abs(k) >= 10 ? Math.round(k) : Math.round(k * 10) / 10
    return `${rounded}k`
  }
  return value.toLocaleString()
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

interface ChartLayout {
  width: number
  height: number
  padding: { top: number; right: number; bottom: number; left: number }
  axisFontSize: number
  labelFontSize: number
  lineWidth: number
  netLineWidth: number
  pointRadius: number
  netPointRadius: number
  maxXLabels: number
}

const DESKTOP_LAYOUT: ChartLayout = {
  width: 720,
  height: 260,
  padding: { top: 16, right: 16, bottom: 40, left: 52 },
  axisFontSize: 12,
  labelFontSize: 11,
  lineWidth: 2.5,
  netLineWidth: 3.5,
  pointRadius: 3.5,
  netPointRadius: 4.5,
  maxXLabels: 10,
}

/** Mobile: native phone width so SVG text stays ~13–15px when rendered full-bleed. */
const MOBILE_LAYOUT: ChartLayout = {
  width: 360,
  height: 300,
  padding: { top: 18, right: 12, bottom: 48, left: 48 },
  axisFontSize: 13,
  labelFontSize: 12,
  lineWidth: 3,
  netLineWidth: 4,
  pointRadius: 5,
  netPointRadius: 6,
  maxXLabels: 5,
}

export default function TrendsChart({ rows }: TrendsChartProps) {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const layout = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT

  const chart = useMemo(() => {
    if (rows.length === 0) return null

    const { width, height, padding, maxXLabels } = layout
    const values = rows.flatMap((row) => [row.intakeCalories, row.totalOutput, row.net])
    const rawMin = Math.min(...values, 0)
    const rawMax = Math.max(...values, 0)
    const paddedMin = rawMin < 0 ? -niceAxisMax(Math.abs(rawMin)) : 0
    const paddedMax = niceAxisMax(rawMax * 1.1)
    const yMin = paddedMin
    const yMax = Math.max(paddedMax, 100)
    const yTicks = buildYAxisTicks(yMin, yMax)

    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom
    const xStep = rows.length > 1 ? plotWidth / (rows.length - 1) : 0

    const scaleY = (value: number) => {
      const ratio = (value - yMin) / (yMax - yMin)
      return padding.top + plotHeight - ratio * plotHeight
    }

    const scaleX = (index: number) => padding.left + index * xStep

    const labelStride =
      rows.length <= maxXLabels
        ? 1
        : Math.max(1, Math.ceil((rows.length - 1) / (maxXLabels - 1)))

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

    return { yMin, yMax, yTicks, paths, labelStride, scaleX, scaleY, width, height, padding }
  }, [rows, layout])

  if (!chart || rows.length === 0) {
    return (
      <p style={{ color: neutrals.textFaint, fontSize: 14, margin: 0 }}>
        No trend data for this period.
      </p>
    )
  }

  const formatYTick = isMobile ? formatCompactKcal : (v: number) => v.toLocaleString()

  return (
    <div className={isMobile ? 'trends-chart trends-chart-mobile' : 'trends-chart'}>
      <div
        role="img"
        aria-label="Line chart of daily intake, total output, and net calories"
        className="trends-chart-canvas"
      >
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          width="100%"
          height="auto"
          style={{ display: 'block', maxWidth: '100%' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {chart.yTicks.map((tick) => {
            const y = chart.scaleY(tick)
            return (
              <g key={tick}>
                <line
                  x1={chart.padding.left}
                  x2={chart.width - chart.padding.right}
                  y1={y}
                  y2={y}
                  stroke={tick === 0 ? '#C4C4C8' : '#ECECEE'}
                  strokeWidth={tick === 0 ? 1.5 : 1}
                />
                <text
                  x={chart.padding.left - 8}
                  y={y + layout.axisFontSize * 0.35}
                  textAnchor="end"
                  fontSize={layout.axisFontSize}
                  fontWeight={500}
                  fill={neutrals.textMuted}
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {formatYTick(tick)}
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
                strokeWidth={series.key === 'net' ? layout.netLineWidth : layout.lineWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((point, index) => (
                <circle
                  key={`${series.key}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={series.key === 'net' ? layout.netPointRadius : layout.pointRadius}
                  fill={series.color}
                  stroke="#ffffff"
                  strokeWidth={isMobile ? 1.5 : 1}
                >
                  <title>
                    {`${formatShortDate(rows[index]!.date)} ${series.label}: ${series
                      .pick(rows[index]!)
                      .toLocaleString()} kcal`}
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
                y={chart.height - (isMobile ? 14 : 12)}
                textAnchor="middle"
                fontSize={layout.labelFontSize}
                fontWeight={600}
                fill={neutrals.textMuted}
                fontFamily="Inter, system-ui, sans-serif"
              >
                {formatShortDate(row.date)}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <div className="trends-chart-legend" aria-hidden="true">
        {SERIES.map((series) => (
          <span key={series.key} className="trends-chart-legend-item">
            <span
              className="trends-chart-legend-swatch"
              style={{ background: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>

      {isMobile && rows.length > 0 && (
        <p className="trends-chart-mobile-hint">
          Tap a point for exact kcal. Y-axis values in thousands shown as k.
        </p>
      )}
    </div>
  )
}
