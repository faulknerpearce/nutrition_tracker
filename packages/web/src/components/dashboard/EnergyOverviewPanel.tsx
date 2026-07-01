import type { NetBalance } from '@nutrition-tracker/shared'
import { netRingProgress } from '../../lib/dashboardCharts'
import { cardSurface, iconTileSm, subtleSurface } from '../../lib/styles'
import HorizontalBarChart from '../charts/HorizontalBarChart'
import ProgressRing from '../charts/ProgressRing'
import OutputCompositionBar from './OutputCompositionBar'

interface EnergyOverviewPanelProps {
  balance: NetBalance
  hasActivities: boolean
}

const statusColor: Record<NetBalance['status'], string> = {
  under: '#2563eb',
  in_range: '#059669',
  over: '#dc2626',
}

const statusBadgeBg: Record<NetBalance['status'], string> = {
  under: '#dbeafe',
  in_range: '#d1fae5',
  over: '#fee2e2',
}

function GoalZoneTrack({ balance }: { balance: NetBalance }) {
  const max = Math.max(balance.goalHigh, balance.net, 1)
  const lowPct = max > 0 ? (balance.goalLow / max) * 100 : 0
  const highPct = max > 0 ? (balance.goalHigh / max) * 100 : 0
  const netPct = max > 0 ? Math.min((balance.net / max) * 100, 100) : 0
  const color = statusColor[balance.status]
  const trackTop = 14
  const trackHeight = 14
  const dotSize = 18
  const trackCenterY = trackTop + trackHeight / 2

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e4e4e7' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#3f3f46',
            textTransform: 'uppercase',
          }}
        >
          Net vs goal
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#059669',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {balance.goalLow.toLocaleString()}–{balance.goalHigh.toLocaleString()} kcal
        </span>
      </div>

      <div style={{ position: 'relative', height: 44, marginBottom: 6 }}>
        <div
          style={{
            position: 'absolute',
            top: trackTop,
            left: 0,
            right: 0,
            height: trackHeight,
            borderRadius: 9999,
            background: '#e4e4e7',
            border: '1px solid #d4d4d8',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: trackTop,
            left: 0,
            height: trackHeight,
            width: `${netPct}%`,
            borderRadius: 9999,
            background: `linear-gradient(90deg, ${color}55, ${color}99)`,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: trackTop,
            left: `${lowPct}%`,
            height: trackHeight,
            width: `${highPct - lowPct}%`,
            borderRadius: 9999,
            background: 'rgba(16, 185, 129, 0.35)',
            border: '2px solid #059669',
            boxSizing: 'border-box',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: trackCenterY,
            left: `calc(${netPct}% - ${dotSize / 2}px)`,
            width: dotSize,
            height: dotSize,
            borderRadius: 9999,
            background: color,
            border: '3px solid white',
            boxShadow: `0 2px 8px ${color}66, 0 0 0 1px ${color}`,
            transform: 'translateY(-50%)',
            transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#a1a1aa',
            }}
          >
            Current
          </span>
          <span style={{ color }}>{balance.net.toLocaleString()}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#059669',
            }}
          >
            Goal
          </span>
          <span style={{ color: '#059669' }}>{balance.goalHigh.toLocaleString()}</span>
        </span>
      </div>
    </div>
  )
}

export default function EnergyOverviewPanel({ balance, hasActivities }: EnergyOverviewPanelProps) {
  const color = statusColor[balance.status]
  const intakeMax = Math.max(balance.goalHigh, balance.consumed, 1)
  const ring = netRingProgress(balance)

  const intakeRow = {
    label: 'Intake',
    value: balance.consumed,
    displayValue: `${balance.consumed.toLocaleString()} kcal`,
    max: intakeMax,
    color: '#ea580c',
    gradient: 'linear-gradient(90deg, #ea580c, #fb923c)',
  }

  return (
    <div style={{ ...cardSurface, padding: 28 }}>
      <div className="dashboard-bento-hero-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '1.5px',
              color: '#134e4b',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Net Energy
          </p>

          <div className="energy-overview-ring-row">
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
              <div className="energy-overview-stats-header">
                <div style={{ ...iconTileSm, background: statusBadgeBg[balance.status] }}>
                  <i className="fa-solid fa-bolt" style={{ color, fontSize: 16 }} />
                </div>
                <div>
                  <span
                    className="net-balance-value-mobile"
                    style={{
                      fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
                      fontSize: 40,
                      fontWeight: 600,
                      lineHeight: 1,
                      color,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {balance.net.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#71717a', marginLeft: 6 }}>
                    kcal net
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#71717a', margin: 0, lineHeight: 1.5 }}>
                {balance.consumed.toLocaleString()} intake · {balance.burned.toLocaleString()} total
                output
              </p>
              <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
                BMR is included automatically in total output. {balance.contextMessage}
              </p>
              {!hasActivities && (
                <p style={{ fontSize: 12, color: '#a1a1aa', margin: '8px 0 0 0' }}>
                  Log activities on Outputs to add exercise burn on top of BMR.
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ ...subtleSurface, padding: '20px 22px' }}>
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
            Today&apos;s balance
          </p>
          <HorizontalBarChart rows={[intakeRow]} />
          <p style={{ fontSize: 11, color: '#a1a1aa', margin: '-4px 0 14px 0' }}>
            Intake vs high calorie goal ({balance.goalHigh.toLocaleString()} kcal).
          </p>
          <OutputCompositionBar balance={balance} />
          <GoalZoneTrack balance={balance} />
        </div>
      </div>
    </div>
  )
}