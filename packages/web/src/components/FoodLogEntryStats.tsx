import type { FoodEntry } from '../lib/entries'

interface FoodLogEntryStatsProps {
  entries: FoodEntry[]
}

export default function FoodLogEntryStats({ entries }: FoodLogEntryStatsProps) {
  const entryCount = entries.length
  if (entryCount === 0) return null

  const totals = entries.reduce(
    (acc, entry) => ({ calories: acc.calories + entry.calories, protein: acc.protein + entry.protein }),
    { calories: 0, protein: 0 },
  )
  const avgProtein = (totals.protein / entryCount).toFixed(1)
  const highestProtein = [...entries].sort((a, b) => b.protein - a.protein)[0]
  const avgCalPerItem = Math.round(totals.calories / entryCount)

  return (
    <div className="metric-grid-stats" style={{ marginTop: 20 }}>
      <div
        style={{
          background: '#fafafa',
          border: '1px solid #e4e4e7',
          borderRadius: 20,
          padding: 16,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Avg Protein per Item</div>
        <div
          style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          {avgProtein}
          <span style={{ fontSize: 14, fontWeight: 500 }}>g</span>
        </div>
      </div>
      <div
        style={{
          background: '#fafafa',
          border: '1px solid #e4e4e7',
          borderRadius: 20,
          padding: 16,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Highest Protein Item</div>
        <div
          style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: '#059669',
          }}
        >
          {highestProtein.protein}
          <span style={{ fontSize: 14, fontWeight: 500 }}>g</span>
        </div>
        <div style={{ fontSize: 11, color: '#a1a1aa' }}>{highestProtein.name}</div>
      </div>
      <div
        style={{
          background: '#fafafa',
          border: '1px solid #e4e4e7',
          borderRadius: 20,
          padding: 16,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Calorie Density</div>
        <div
          style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          {avgCalPerItem}
        </div>
        <div style={{ fontSize: 11, color: '#a1a1aa' }}>kcal per item (avg)</div>
      </div>
    </div>
  )
}