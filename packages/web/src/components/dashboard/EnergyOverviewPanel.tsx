import type { NetBalance } from '@nutrition-tracker/shared'
import { netRingProgress } from '../../lib/dashboardCharts'
import { cardSurface, iconTileSm, subtleSurface } from '../../lib/styles'
import HorizontalBarChart from '../charts/HorizontalBarChart'
import ProgressRing from '../charts/ProgressRing'

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

function GoalZoneTrack({ balance, max }: { balance: NetBalance; max: number }) {
  const lowPct = max > 0 ? (balance.goalLow / max) * 100 : 0
  const highPct = max > 0 ? (balance.goalHigh / max) * 100 : 0
  const netPct = max > 0 ? Math.min((balance.net / max) * 100, 100) : 0
  const color = statusColor[balance.status]

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e4e4e7' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#71717a',
            textTransform: 'uppercase',
          }}
        >
          Net vs goal
        </span>
        <span style={{ fontSize: 11, color: '#a1a1aa' }}>
          {balance.goalLow.toLocaleString()}–{balance.goalHigh.toLocaleString()} kcal
        </span>
      </div>
      <div style={{ position: 'relative', height: 28 }}>
        <div
          style={{
            position: 'absolute',
            inset: '10px 0',
            borderRadius: 9999,
            background: '#f4f4f5',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            bottom: 10,
            left: `${lowPct}%`,
            width: `${highPct - lowPct}%`,
            borderRadius: 9999,
            background: '#d1fae5',
            border: '1px solid #a7f3d0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: `calc(${netPct}% - 6px)`,
            width: 12,
            height: 12,
            borderRadius: 9999,
            background: color,
            boxShadow: `0 0 0 3px white, 0 0 0 4px ${color}44`,
            transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  )
}

export default function EnergyOverviewPanel({ balance, hasActivities }: EnergyOverviewPanelProps) {
  const color = statusColor[balance.status]
  const chartMax = Math.max(balance.consumed, balance.net, balance.goalHigh, 1)
  const ring = netRingProgress(balance)

  const barRows = [
    {
      label: 'Consumed',
      value: balance.consumed,
      displayValue: `${balance.consumed.toLocaleString()} kcal`,
      max: chartMax,
      color: '#ea580c',
      gradient: 'linear-gradient(90deg, #ea580c, #fb923c)',
    },
    {
      label: 'Burned',
      value: balance.burned,
      displayValue: `${balance.burned.toLocaleString()} kcal`,
      max: chartMax,
      color: '#0d9488',
      gradient: 'linear-gradient(90deg, #0d9488, #14b8a6)',
    },
    {
      label: 'Net',
      value: balance.net,
      displayValue: `${balance.net.toLocaleString()} kcal`,
      max: chartMax,
      color,
      gradient: `linear-gradient(90deg, ${color}, ${color}cc)`,
    },
  ]

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <ProgressRing
              value={balance.net}
              goal={balance.goalHigh}
              color={color}
              size={148}
              strokeWidth={12}
              centerLabel={balance.net.toLocaleString()}
              centerSubLabel={`${ring.pct}% of high`}
              ariaLabel={`Net energy ${balance.net} kilocalories, ${ring.pct} percent of high goal`}
            />

            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
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
                {balance.consumed.toLocaleString()} consumed · {balance.burned.toLocaleString()}{' '}
                burned
              </p>
              <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
                {balance.contextMessage}
              </p>
              {!hasActivities && (
                <p style={{ fontSize: 12, color: '#a1a1aa', margin: '8px 0 0 0' }}>
                  Log an activity on Outputs to track calories burned.
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
            Energy breakdown
          </p>
          <HorizontalBarChart rows={barRows} />
          <GoalZoneTrack balance={balance} max={chartMax} />
        </div>
      </div>
    </div>
  )
}