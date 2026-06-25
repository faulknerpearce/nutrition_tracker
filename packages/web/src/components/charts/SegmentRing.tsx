import type { MacroSegment } from '../../lib/dashboardCharts'
import { macroTotalCalories } from '../../lib/dashboardCharts'

interface SegmentRingProps {
  segments: readonly MacroSegment[]
  size?: number
  strokeWidth?: number
  centerLabel: string
  centerSubLabel?: string
  ariaLabel: string
}

const RING_TRANSITION = 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)'

export default function SegmentRing({
  segments,
  size = 160,
  strokeWidth = 14,
  centerLabel,
  centerSubLabel,
  ariaLabel,
}: SegmentRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  const total = macroTotalCalories(segments)

  let offset = 0
  const arcs = segments
    .filter((s) => s.calories > 0)
    .map((segment) => {
      const fraction = total > 0 ? segment.calories / total : 0
      const length = circumference * fraction
      const arc = {
        ...segment,
        dashArray: `${length} ${circumference - length}`,
        dashOffset: -offset,
      }
      offset += length
      return arc
    })

  return (
    <div>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={ariaLabel}
          style={{ display: 'block', transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f4f4f5"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              style={{ transition: RING_TRANSITION }}
            />
          ))}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.1,
              color: '#18181b',
            }}
          >
            {centerLabel}
          </span>
          {centerSubLabel && (
            <span style={{ fontSize: 11, fontWeight: 500, color: '#71717a', marginTop: 2 }}>
              {centerSubLabel}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px 16px',
          marginTop: 16,
        }}
      >
        {segments.map((segment) => {
          const pct = total > 0 ? Math.round((segment.calories / total) * 100) : 0
          return (
            <div
              key={segment.label}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: segment.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#52525b', fontWeight: 500 }}>{segment.label}</span>
              <span style={{ color: '#a1a1aa' }}>
                {segment.grams}g · {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}