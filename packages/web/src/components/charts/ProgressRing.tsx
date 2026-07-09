interface ProgressRingProps {
  value: number
  goal: number
  color: string
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerSubLabel?: string
  ariaLabel: string
}

const RING_TRANSITION = 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)'

export default function ProgressRing({
  value,
  goal,
  color,
  size = 120,
  strokeWidth = 10,
  centerLabel,
  centerSubLabel,
  ariaLabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // Never paint a fill for zero/negative values (e.g. negative net kcal)
  const fillRatio = goal > 0 && value > 0 ? Math.min(value / goal, 1) : 0
  const dashOffset = circumference * (1 - fillRatio)
  const displayPct = goal > 0 ? Math.round((value / goal) * 100) : 0
  const center = size / 2

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
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
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: RING_TRANSITION }}
        />
        {goal > 0 && value > goal && value > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.08} ${circumference}`}
            strokeDashoffset={0}
            opacity={0.45}
          />
        )}
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
        {centerLabel && (
          <span
            style={{
              fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
              fontSize: size >= 140 ? 28 : size >= 100 ? 20 : 16,
              fontWeight: 600,
              lineHeight: 1.1,
              color: centerLabel.endsWith('%') ? color : '#18181b',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {centerLabel}
          </span>
        )}
        {(!centerLabel || centerSubLabel) && (
          <span
            style={{
              fontSize: size >= 140 ? 13 : 11,
              fontWeight: 600,
              color,
              marginTop: centerLabel ? 2 : 0,
            }}
          >
            {centerSubLabel ?? `${displayPct}%`}
          </span>
        )}
      </div>
    </div>
  )
}