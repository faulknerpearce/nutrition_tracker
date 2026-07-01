import type { NetBalance } from '@nutrition-tracker/shared'

interface OutputCompositionBarProps {
  balance: NetBalance
}

export default function OutputCompositionBar({ balance }: OutputCompositionBarProps) {
  const { bmr, activityCalories, burned } = balance
  const bmrShare = burned > 0 ? (bmr / burned) * 100 : 100
  const activityShare = burned > 0 ? (activityCalories / burned) * 100 : 0

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
        <span style={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>Total output</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#3f3f46',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {burned.toLocaleString()} kcal
        </span>
      </div>

      <div
        role="img"
        aria-label={`Total output ${burned} kilocalories: BMR ${bmr}, activity ${activityCalories}`}
        style={{
          display: 'flex',
          height: 12,
          borderRadius: 9999,
          overflow: 'hidden',
          background: '#e4e4e7',
        }}
      >
        <div
          style={{
            width: `${bmrShare}%`,
            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          title={`BMR ${bmr.toLocaleString()} kcal`}
        />
        {activityShare > 0 && (
          <div
            style={{
              width: `${activityShare}%`,
              background: 'linear-gradient(90deg, #0d9488, #14b8a6)',
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
          color: '#71717a',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: '#6366f1',
              flexShrink: 0,
            }}
          />
          BMR {bmr.toLocaleString()} kcal
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: '#0d9488',
              flexShrink: 0,
            }}
          />
          Activity {activityCalories.toLocaleString()} kcal
        </span>
      </div>
      <p style={{ fontSize: 11, color: '#a1a1aa', margin: '6px 0 0 0', lineHeight: 1.4 }}>
        Composition of today&apos;s burn — not compared to a target.
      </p>
    </div>
  )
}