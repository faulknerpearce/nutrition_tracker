import type { Totals } from '@nutrition-tracker/shared'
import { macroCalorieSplit, macroTotalCalories } from '../../lib/dashboardCharts'
import { cardSurface } from '../../lib/styles'
import SegmentRing from '../charts/SegmentRing'

interface MacroSplitPanelProps {
  totals: Totals
}

export default function MacroSplitPanel({ totals }: MacroSplitPanelProps) {
  const segments = macroCalorieSplit(totals)
  const totalCal = macroTotalCalories(segments)
  const hasData = totalCal > 0

  return (
    <div
      style={{
        ...cardSurface,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '1.5px',
          color: '#134e4b',
          textTransform: 'uppercase',
          margin: '0 0 8px 0',
        }}
      >
        Macro Split
      </p>
      <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>
        Calorie share from protein, carbs, and fat
      </p>

      {hasData ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SegmentRing
            segments={segments}
            size={168}
            strokeWidth={14}
            centerLabel={`${totalCal.toLocaleString()}`}
            centerSubLabel="macro kcal"
            ariaLabel={`Macro calories: protein ${segments[0].calories}, carbs ${segments[1].calories}, fat ${segments[2].calories}`}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px 0',
          }}
        >
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0 }}>
            Log food to see your macro breakdown
          </p>
        </div>
      )}
    </div>
  )
}