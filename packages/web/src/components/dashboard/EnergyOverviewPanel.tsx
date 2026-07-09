import type { NetBalance } from '@nutrition-tracker/shared'
import { netRingProgress } from '../../lib/dashboardCharts'
import { neutrals, radius, type as typeScale } from '../../lib/design-tokens'
import ProgressRing from '../charts/ProgressRing'
import DayNavigator from '../layout/DayNavigator'
import Card from '../ui/Card'
import OutputCompositionBar from './OutputCompositionBar'

interface EnergyOverviewPanelProps {
  balance: NetBalance
  hasActivities: boolean
  /** ISO date shown in this card (supports day browsing). */
  date: string
  isToday: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  dayLoading?: boolean
  onPrevious: () => void
  onNext: () => void
  onGoToToday: () => void
}

/** Status of net kcal vs the daily goal band (low–high). */
const statusLabel: Record<NetBalance['status'], string> = {
  under: 'Under goal',
  in_range: 'In range',
  over: 'Over goal',
}

/** Theme-aligned chart colors (golden hour wellness palette). */
const GOAL_GREEN = '#5BA88A'
const GOAL_GREEN_SOFT = 'rgba(91, 168, 138, 0.28)'
const GOAL_GREEN_BORDER = '#4A9A7A'

const statusColor: Record<NetBalance['status'], string> = {
  under: '#568FEB', // dashboard blue (chroma-matched family)
  in_range: GOAL_GREEN,
  over: '#E86A3C', // outputs coral
}

const statusBadgeBg: Record<NetBalance['status'], string> = {
  under: 'rgba(107, 141, 181, 0.18)',
  in_range: 'rgba(91, 168, 138, 0.18)',
  over: 'rgba(232, 106, 60, 0.16)',
}

/** Net position on a track with the goal low–high band highlighted. */
function GoalZoneTrack({ balance }: { balance: NetBalance }) {
  const max = Math.max(balance.goalHigh, balance.net, 1)
  const lowPct = max > 0 ? (balance.goalLow / max) * 100 : 0
  const highPct = max > 0 ? (balance.goalHigh / max) * 100 : 0
  const netPct = max > 0 ? Math.min(Math.max(balance.net, 0) / max * 100, 100) : 0
  const color = statusColor[balance.status]
  const trackTop = 10
  const trackHeight = 12
  const dotSize = 14
  const trackCenterY = trackTop + trackHeight / 2

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${neutrals.border}` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: neutrals.textMuted,
            textTransform: 'uppercase',
          }}
        >
          Net vs goal
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: statusColor.in_range,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {balance.goalLow.toLocaleString()}–{balance.goalHigh.toLocaleString()} kcal
        </span>
      </div>

      <div style={{ position: 'relative', height: 36, marginBottom: 4 }}>
        <div
          style={{
            position: 'absolute',
            top: trackTop,
            left: 0,
            right: 0,
            height: trackHeight,
            borderRadius: 9999,
            background: neutrals.surfaceHover,
            border: `1px solid ${neutrals.borderStrong}`,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
          }}
        />
        {balance.net > 0 && (
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
        )}
        <div
          style={{
            position: 'absolute',
            top: trackTop,
            left: `${lowPct}%`,
            height: trackHeight,
            width: `${Math.max(highPct - lowPct, 0)}%`,
            borderRadius: 9999,
            background: GOAL_GREEN_SOFT,
            border: `2px solid ${GOAL_GREEN_BORDER}`,
            boxSizing: 'border-box',
          }}
        />
        {balance.net > 0 && (
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
        )}
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
              color: neutrals.textFaint,
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
              color: GOAL_GREEN,
            }}
          >
            Goal high
          </span>
          <span style={{ color: GOAL_GREEN }}>{balance.goalHigh.toLocaleString()}</span>
        </span>
      </div>
    </div>
  )
}

export default function EnergyOverviewPanel({
  balance,
  hasActivities,
  date,
  isToday,
  canGoBack = true,
  canGoForward = false,
  dayLoading = false,
  onPrevious,
  onNext,
  onGoToToday,
}: EnergyOverviewPanelProps) {
  const color = statusColor[balance.status]
  const ring = netRingProgress(balance)
  // Fill only when net is positive; still show true % (including negative) in the center
  const ringFillValue = balance.net > 0 ? balance.net : 0
  const ringCenterLabel = `${ring.pct}%`

  return (
    <Card tone="neutral" style={{ padding: '16px 18px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 8,
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
          Daily energy
        </p>
        <span
          title={
            balance.status === 'under'
              ? 'Net kcal is below your low goal — still building toward the target range'
              : balance.status === 'over'
                ? 'Net kcal is above your high goal'
                : 'Net kcal is within your low–high goal range'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: radius.pill,
            background: statusBadgeBg[balance.status],
            color,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {statusLabel[balance.status]}
        </span>
      </div>

      <div className="energy-day-nav" style={{ marginBottom: 12 }}>
        <DayNavigator
          date={date}
          isToday={isToday}
          compact
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onPrevious={onPrevious}
          onNext={onNext}
          onGoToToday={onGoToToday}
          itemLabel={{ singular: 'log day', plural: 'log days' }}
        />
      </div>

      <div
        className="energy-overview-ring-row"
        style={{
          marginBottom: 12,
          opacity: dayLoading ? 0.55 : 1,
          transition: 'opacity 0.15s ease',
          pointerEvents: dayLoading ? 'none' : undefined,
        }}
      >
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
                : `Net energy ${balance.net} kilocalories, ${ring.pct} percent of high goal`
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

      {/* Output breakdown: BMR vs activity (what makes up burn) */}
      <div style={{ opacity: dayLoading ? 0.55 : 1, transition: 'opacity 0.15s ease' }}>
        <OutputCompositionBar balance={balance} isToday={isToday} />
        <GoalZoneTrack balance={balance} />
      </div>
    </Card>
  )
}
