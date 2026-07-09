import type { NetBalance } from '@nutrition-tracker/shared'
import { netRingProgress } from '../../lib/dashboardCharts'
import { atmosphere, neutrals, radius, type as typeScale } from '../../lib/design-tokens'
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

export default function EnergyOverviewPanel({ balance, hasActivities }: EnergyOverviewPanelProps) {
  const color = statusColor[balance.status]
  const ring = netRingProgress(balance)
  const goalSpan = Math.max(balance.goalHigh, 1)
  const intakePct = Math.min((balance.consumed / goalSpan) * 100, 100)
  const outputPct = Math.min((balance.burned / goalSpan) * 100, 100)
  const netVsHighPct = Math.min(Math.max(balance.net, 0) / goalSpan * 100, 100)
  const goalBandPct = Math.min(((balance.goalHigh - balance.goalLow) / goalSpan) * 100, 100)
  const ringFillValue = balance.net > 0 ? balance.net : 0
  const ringCenterLabel = balance.net < 0 ? '—' : `${Math.max(ring.pct, 0)}%`

  return (
    <Card tone="neutral" style={{ padding: '16px 18px' }}>
      {/* Compact header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <p
          style={{
            fontSize: typeScale.eyebrow,
            fontWeight: 600,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            color: neutrals.textPrimary,
            margin: 0,
          }}
        >
          Today&apos;s energy
        </p>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: radius.pill,
            background: `${color}18`,
            color,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {statusLabel[balance.status]}
        </span>
      </div>

      {/* Ring + hero stats (horizontal when space allows) */}
      <div className="energy-overview-ring-row" style={{ marginBottom: 14 }}>
        <div className="energy-overview-ring">
          <ProgressRing
            value={ringFillValue}
            goal={balance.goalHigh}
            color={color}
            size={112}
            strokeWidth={10}
            centerLabel={ringCenterLabel}
            ariaLabel={
              balance.net < 0
                ? `Net energy ${balance.net} kilocalories, ring empty while net is negative`
                : `Net energy ${balance.net} kilocalories, ${ring.pct} percent of goal`
            }
          />
        </div>

        <div className="energy-overview-stats">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: neutrals.textPrimary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {balance.net.toLocaleString()}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: neutrals.textMuted }}>kcal net</span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: neutrals.textMuted,
              margin: '6px 0 0 0',
              lineHeight: 1.35,
            }}
          >
            {balance.contextMessage}
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 12, color: neutrals.textMuted }}>
              <strong style={{ color: neutrals.textPrimary, fontWeight: 600 }}>
                {balance.consumed.toLocaleString()}
              </strong>{' '}
              in
            </span>
            <span style={{ fontSize: 12, color: neutrals.textMuted }}>
              <strong style={{ color: neutrals.textPrimary, fontWeight: 600 }}>
                {balance.burned.toLocaleString()}
              </strong>{' '}
              out
            </span>
            {!hasActivities && balance.activityCalories === 0 && (
              <span style={{ fontSize: 11, color: neutrals.textFaint }}>BMR only</span>
            )}
          </div>
        </div>
      </div>

      {/* Compact dual meters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 6,
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: neutrals.textMuted,
            }}
          >
            <span>Intake</span>
            <span style={{ color: neutrals.textPrimary }}>{Math.round(intakePct)}%</span>
          </div>
          <GradientMeter
            value={intakePct}
            gradient={atmosphere.gradients.peach}
            height={6}
            aria-label={`Intake ${Math.round(intakePct)}% of goal`}
          />
        </div>
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 6,
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: neutrals.textMuted,
            }}
          >
            <span>Output</span>
            <span style={{ color: neutrals.textPrimary }}>{Math.round(outputPct)}%</span>
          </div>
          <GradientMeter
            value={outputPct}
            gradient={atmosphere.gradients.cool}
            height={6}
            aria-label={`Output ${Math.round(outputPct)}% of goal`}
          />
        </div>
      </div>

      {/* Goal range track */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 5,
            gap: 8,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: neutrals.textMuted,
              margin: 0,
            }}
          >
            Goal range
          </p>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: neutrals.textPrimary,
              margin: 0,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {balance.goalLow.toLocaleString()}–{balance.goalHigh.toLocaleString()}
          </p>
        </div>
        <div
          style={{
            position: 'relative',
            height: 8,
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
          {balance.net > 0 && (
            <div
              style={{
                position: 'absolute',
                left: `calc(${Math.min(netVsHighPct, 100)}% - 5px)`,
                top: '50%',
                width: 10,
                height: 10,
                borderRadius: radius.pill,
                background: neutrals.textPrimary,
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transform: 'translateY(-50%)',
              }}
            />
          )}
        </div>
      </div>
    </Card>
  )
}
