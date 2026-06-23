export interface MetricConfig {
  label: string
  value: number
  formatValue: (v: number) => string
  unit: string | null
  goal: number
  formatGoal: (g: number) => string
  color: string
  iconBg: string
  iconClass: string
  gradient: string
  rightLabel: string
  remainingSuffix: string
  remaining: (value: number, goal: number) => string
}

interface MetricCardProps {
  config: MetricConfig
}

export default function MetricCard({ config }: MetricCardProps) {
  const pct = Math.round((config.value / config.goal) * 100)
  const widthPct = Math.min(pct, 100)
  const remainingText = config.remaining(config.value, config.goal)

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e4e4e7',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              background: config.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <i
              className={`fa-solid ${config.iconClass}`}
              style={{ color: config.color, fontSize: 22 }}
            ></i>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#71717a', fontWeight: 500 }}>{config.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: config.unit ? 4 : 0 }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
                  fontSize: 42,
                  fontWeight: 600,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {config.formatValue(config.value)}
              </span>
              {config.unit && (
                <span style={{ fontSize: 18, fontWeight: 500, color: config.color }}>
                  {config.unit}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: config.color }}>{pct}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: config.color }}>%</span>
          </div>
          <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: -2 }}>{config.rightLabel}</div>
        </div>
      </div>
      <div style={{ marginBottom: 4 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          <div style={{ color: '#71717a' }}>Consumed</div>
          <div style={{ fontFamily: 'monospace', color: config.color }}>
            {config.formatValue(config.value)} / {config.formatGoal(config.goal)}
          </div>
        </div>
        <div
          style={{ height: 10, backgroundColor: '#f4f4f5', borderRadius: 9999, overflow: 'hidden' }}
        >
          <div
            style={{
              height: '100%',
              background: config.gradient,
              borderRadius: 9999,
              width: `${widthPct}%`,
            }}
          />
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#a1a1aa' }}>
        Remaining: <span style={{ fontWeight: 500, color: '#3f3f46' }}>{remainingText}</span>
      </div>
    </div>
  )
}
