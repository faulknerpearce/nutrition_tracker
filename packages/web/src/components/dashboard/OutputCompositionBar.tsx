import type { NetBalance } from '@nutrition-tracker/shared'
import { neutrals } from '../../lib/design-tokens'

interface OutputCompositionBarProps {
  balance: NetBalance
  /** When false, copy says "this day" instead of "today". */
  isToday?: boolean
}

/** Richer dusk purple — baseline burn (not activity). */
const BMR_COLOR = '#6B4CE0'
const BMR_STRIPE = 'rgba(255, 255, 255, 0.38)'
/** Diagonally dashed / hatched fill over solid purple. */
const BMR_HATCH = `repeating-linear-gradient(
  -45deg,
  ${BMR_COLOR} 0 4px,
  color-mix(in srgb, ${BMR_COLOR} 72%, #1a1035) 4px 5px,
  ${BMR_COLOR} 5px 9px,
  ${BMR_STRIPE} 9px 11px
)`

/** Burn coral (outputs accent) — activity share of burn. */
const ACTIVITY_COLOR = '#E86A3C'
const ACTIVITY_GRADIENT = 'linear-gradient(90deg, #E86A3C, #FF9F5C)'

export default function OutputCompositionBar({ balance, isToday = true }: OutputCompositionBarProps) {
  const { bmr, activityCalories, burned } = balance
  const bmrShare = burned > 0 ? (bmr / burned) * 100 : 100
  const activityShare = burned > 0 ? (activityCalories / burned) * 100 : 0
  const dayWord = isToday ? "today's" : "this day's"

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: neutrals.textMuted }}>Total output</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: neutrals.textSecondary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {burned.toLocaleString()} kcal
        </span>
      </div>

      <div
        role="img"
        aria-label={`Total output ${burned} kilocalories: BMR ${bmr} (baseline, hatched), activity ${activityCalories}`}
        style={{
          display: 'flex',
          height: 12,
          borderRadius: 9999,
          overflow: 'hidden',
          background: neutrals.surfaceHover,
        }}
      >
        <div
          style={{
            width: `${bmrShare}%`,
            background: BMR_HATCH,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title={`BMR (baseline) ${bmr.toLocaleString()} kcal`}
        />
        {activityShare > 0 && (
          <div
            style={{
              width: `${activityShare}%`,
              background: ACTIVITY_GRADIENT,
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            title={`Activity ${activityCalories.toLocaleString()} kcal`}
          />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 16px',
          marginTop: 8,
          fontSize: 11,
          color: neutrals.textMuted,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: BMR_HATCH,
              border: `1px solid ${BMR_COLOR}`,
              flexShrink: 0,
            }}
          />
          BMR {bmr.toLocaleString()} kcal
          <span style={{ color: neutrals.textFaint }}>(baseline)</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: ACTIVITY_COLOR,
              flexShrink: 0,
            }}
          />
          Activity {activityCalories.toLocaleString()} kcal
        </span>
      </div>
      <p style={{ fontSize: 11, color: neutrals.textFaint, margin: '6px 0 0 0', lineHeight: 1.4 }}>
        Composition of {dayWord} burn — hatched BMR is resting metabolism, not logged activity.
      </p>
    </div>
  )
}
