import type { NetBalance } from '@nutrition-tracker/shared'
import { netRingProgress } from '../../lib/dashboardCharts'
import { atmosphere, neutrals, radius, type } from '../../lib/design-tokens'
import ProgressRing from '../charts/ProgressRing'
import Card from '../ui/Card'
import GradientMeter from '../ui/GradientMeter'

interface EnergyOverviewPanelProps {
  balance: NetBalance
  hasActivities: boolean
}

const statusLabel: Record<NetBalance['status'], string> = {
  under: 'Building',
  in_range: 'Balanced',
  over: 'Above range',
}

const statusColor: Record<NetBalance['status'], string> = {
  under: '#5AC8FA',
  in_range: '#34C759',
  over: '#FF453A',
}

const statusGradient: Record<NetBalance['status'], string> = {
  under: atmosphere.gradients.cool,
  in_range: atmosphere.gradients.warmCool,
  over: atmosphere.gradients.dangerCool,
}

function AccentDots() {
  return (
    <span
      style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, marginLeft: 8 }}
      aria-hidden="true"
    >
      {atmosphere.accentDots.map((color) => (
        <span
          key={color}
          style={{
            width: 6,
            height: 6,
            borderRadius: radius.pill,
            background: color,
          }}
        />
      ))}
    </span>
  )
}

function MetricCol({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: neutrals.textMuted,
          margin: '0 0 6px 0',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          margin: 0,
          color: neutrals.textPrimary,
          lineHeight: 1.1,
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 14, fontWeight: 500, color: neutrals.textMuted, marginLeft: 4 }}>
            {unit}
          </span>
        )}
      </p>
    </div>
  )
}

function MeterRow({
  label,
  valueText,
  pct,
  gradient,
}: {
  label: string
  valueText: string
  pct: number
  gradient: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        columnGap: 16,
        rowGap: 8,
        alignItems: 'end',
      }}
    >
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: neutrals.textMuted,
            margin: '0 0 4px 0',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 600,
            margin: 0,
            color: neutrals.textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          {valueText}
        </p>
      </div>
      <div style={{ width: 96, paddingBottom: 4 }}>
        <GradientMeter value={pct} gradient={gradient} height={7} aria-label={`${label} ${pct}%`} />
      </div>
    </div>
  )
}

export default function EnergyOverviewPanel({ balance, hasActivities }: EnergyOverviewPanelProps) {
  const color = statusColor[balance.status]
  const ring = netRingProgress(balance)
  const goalSpan = Math.max(balance.goalHigh, 1)
  const intakePct = Math.min((balance.consumed / goalSpan) * 100, 100)
  const outputPct = Math.min((balance.burned / goalSpan) * 100, 100)
  const activityPct =
    balance.burned > 0
      ? Math.min((balance.activityCalories / Math.max(balance.burned, 1)) * 100, 100)
      : 0
  const netVsHighPct = Math.min((balance.net / goalSpan) * 100, 100)
  const goalBandPct = Math.min(((balance.goalHigh - balance.goalLow) / goalSpan) * 100, 100)

  return (
    <Card tone="neutral" style={{ padding: 28 }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <p
              style={{
                fontSize: type.eyebrow,
                fontWeight: 600,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: neutrals.textPrimary,
                margin: 0,
              }}
            >
              Today&apos;s energy
            </p>
            <AccentDots />
          </div>
          <p
            style={{
              fontSize: 11,
              color: neutrals.textMuted,
              margin: '6px 0 0 0',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Fuel, movement &amp; balance
          </p>
        </div>
        <i
          className="fa-regular fa-sun"
          style={{ fontSize: 22, color: neutrals.textFaint, marginTop: 2 }}
          aria-hidden="true"
        />
      </div>

      {/* Hero: ring + large metric */}
      <div className="energy-overview-ring-row" style={{ marginBottom: 28 }}>
        <div className="energy-overview-ring">
          <ProgressRing
            value={balance.net}
            goal={balance.goalHigh}
            color={color}
            size={148}
            strokeWidth={12}
            centerLabel={`${ring.pct}%`}
            ariaLabel={`Net energy ${balance.net} kilocalories, ${ring.pct} percent of goal`}
          />
        </div>

        <div className="energy-overview-stats">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: type.hero,
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: neutrals.textPrimary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {balance.net.toLocaleString()}
            </span>
            <span style={{ fontSize: 18, fontWeight: 500, color: neutrals.textMuted }}>kcal net</span>
          </div>
          <p
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              margin: '12px 0 0 0',
              padding: '4px 10px',
              borderRadius: radius.pill,
              background: `${color}18`,
              color,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {statusLabel[balance.status]}
          </p>
          <p style={{ fontSize: 13, color: neutrals.textMuted, margin: '12px 0 0 0', lineHeight: 1.45 }}>
            {balance.contextMessage}
          </p>
        </div>
      </div>

      {/* Two-column summary */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          marginBottom: 28,
          paddingBottom: 24,
          borderBottom: `1px solid ${neutrals.border}`,
        }}
      >
        <MetricCol label="Calories in" value={balance.consumed.toLocaleString()} unit="kcal" />
        <MetricCol label="Calories out" value={balance.burned.toLocaleString()} unit="kcal" />
      </div>

      {/* Meter rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
        <MeterRow
          label="Intake vs goal"
          valueText={`${Math.round(intakePct)}%`}
          pct={intakePct}
          gradient={atmosphere.gradients.peach}
        />
        <MeterRow
          label="Output load"
          valueText={`${Math.round(outputPct)}%`}
          pct={outputPct}
          gradient={atmosphere.gradients.cool}
        />
        <MeterRow
          label="Activity share"
          valueText={
            hasActivities || balance.activityCalories > 0
              ? `${Math.round(activityPct)}%`
              : 'BMR only'
          }
          pct={hasActivities || balance.activityCalories > 0 ? activityPct : 8}
          gradient={statusGradient[balance.status]}
        />
      </div>

      {/* Full-width goal visibility bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
            gap: 12,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: neutrals.textMuted,
              margin: 0,
            }}
          >
            Goal range
          </p>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: neutrals.textPrimary,
              margin: 0,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {balance.goalLow.toLocaleString()}–{balance.goalHigh.toLocaleString()} kcal
          </p>
        </div>
        <div
          style={{
            position: 'relative',
            height: 12,
            borderRadius: radius.pill,
            background: 'linear-gradient(90deg, #FFE8C8 0%, #FFDB85 35%, #B8D4E8 70%, #9BB8D4 100%)',
            overflow: 'hidden',
          }}
          role="img"
          aria-label={`Net ${balance.net} within goal ${balance.goalLow} to ${balance.goalHigh}`}
        >
          <div
            style={{
              position: 'absolute',
              left: `${(balance.goalLow / goalSpan) * 100}%`,
              width: `${goalBandPct}%`,
              top: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.35)',
              borderLeft: '1px solid rgba(255,255,255,0.7)',
              borderRight: '1px solid rgba(255,255,255,0.7)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `calc(${Math.min(netVsHighPct, 100)}% - 6px)`,
              top: '50%',
              width: 12,
              height: 12,
              borderRadius: radius.pill,
              background: neutrals.textPrimary,
              border: '2px solid white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              transform: 'translateY(-50%)',
            }}
          />
        </div>
        {!hasActivities && balance.activityCalories === 0 && (
          <p style={{ fontSize: 12, color: neutrals.textFaint, margin: '12px 0 0 0' }}>
            Log activities on Outputs to add exercise burn on top of BMR.
          </p>
        )}
      </div>
    </Card>
  )
}
