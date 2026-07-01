import {
  formatDayLabel,
  summarizeDailyEnergyPeriod,
  type DailyEnergySnapshot,
  type TrendsRangePreset,
} from '@nutrition-tracker/shared'
import { useState } from 'react'
import { cardSurface } from '../../lib/styles'
import { useMediaQuery } from '../../lib/useMediaQuery'
import TrendsChart from './TrendsChart'

interface TrendsPanelProps {
  rows: DailyEnergySnapshot[]
  preset: TrendsRangePreset
  customStart: string
  customEnd: string
  loading: boolean
  error: string | null
  onPresetChange: (preset: TrendsRangePreset) => void
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
}

type TrendsView = 'table' | 'chart'

const PRESETS: { value: TrendsRangePreset; label: string }[] = [
  { value: 'last_7', label: 'Last 7 days' },
  { value: 'last_30', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
]

const VIEW_OPTIONS: { value: TrendsView; label: string }[] = [
  { value: 'table', label: 'Table' },
  { value: 'chart', label: 'Chart' },
]

function formatDelta(value: number | null): string {
  if (value === null) return '—'
  if (value > 0) return `+${value.toLocaleString()}`
  return value.toLocaleString()
}

function deltaColor(value: number | null): string {
  if (value === null) return '#a1a1aa'
  if (value > 0) return '#dc2626'
  if (value < 0) return '#059669'
  return '#71717a'
}

function TrendSummaryCards({ summary, summaryId }: { summary: ReturnType<typeof summarizeDailyEnergyPeriod>; summaryId: string }) {
  return (
    <div id={summaryId} className="trends-summary-cards" aria-label="Period summary" style={{ marginTop: 20 }}>
      <div className="trends-summary-card trends-table-summary-total">
        <p className="trends-summary-card-label">Period total</p>
        <p className="trends-summary-card-value">
          {summary.netTotal.toLocaleString()} kcal net
        </p>
        <p className="trends-summary-card-meta">
          {summary.intakeTotal.toLocaleString()} intake ·{' '}
          {summary.totalOutputTotal.toLocaleString()} output
        </p>
      </div>
      <div className="trends-summary-card trends-table-summary-average">
        <p className="trends-summary-card-label">Daily average</p>
        <p className="trends-summary-card-value">
          {summary.netAverage.toLocaleString()} kcal net
        </p>
        <p className="trends-summary-card-meta">
          {summary.intakeAverage.toLocaleString()} intake ·{' '}
          {summary.totalOutputAverage.toLocaleString()} output
        </p>
      </div>
    </div>
  )
}

export default function TrendsPanel({
  rows,
  preset,
  customStart,
  customEnd,
  loading,
  error,
  onPresetChange,
  onCustomStartChange,
  onCustomEndChange,
}: TrendsPanelProps) {
  const [view, setView] = useState<TrendsView>('chart')
  const isMobile = useMediaQuery('(max-width: 639px)')
  const summary = summarizeDailyEnergyPeriod(rows)
  const displayRows = [...rows].reverse()
  const summaryId = 'trends-period-summary'

  return (
    <div style={{ ...cardSurface, padding: 24 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '1.5px',
              color: '#134e4b',
              textTransform: 'uppercase',
              margin: '0 0 4px 0',
            }}
          >
            Trends
          </p>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 600,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Net energy history
          </h3>
        </div>

        <div className="trends-controls">
          <div className="trends-preset-row">
            {PRESETS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onPresetChange(option.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 9999,
                  border: preset === option.value ? '1px solid #134e4b' : '1px solid #e4e4e7',
                  background: preset === option.value ? '#ecfdf5' : 'white',
                  color: preset === option.value ? '#134e4b' : '#52525b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="trends-view-toggle" role="group" aria-label="Trends view">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  view === option.value
                    ? 'trends-view-toggle-button trends-view-toggle-button-active'
                    : 'trends-view-toggle-button'
                }
                aria-pressed={view === option.value}
                onClick={() => setView(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {preset === 'custom' && (
        <div className="modal-form-grid" style={{ marginBottom: 16, maxWidth: 420 }}>
          <div>
            <label htmlFor="trends-start" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
              Start date
            </label>
            <input
              id="trends-start"
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #e4e4e7',
              }}
            />
          </div>
          <div>
            <label htmlFor="trends-end" style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
              End date
            </label>
            <input
              id="trends-end"
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #e4e4e7',
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ color: '#71717a', fontSize: 13 }}>Loading trends...</p>
      ) : view === 'chart' ? (
        <>
          <TrendsChart rows={rows} />
          {rows.length > 0 && (
            <TrendSummaryCards summary={summary} summaryId={summaryId} />
          )}
        </>
      ) : isMobile ? (
        <>
          <div className="trends-mobile-cards" role="list" aria-label="Daily energy breakdown">
            {displayRows.map((row) => (
              <article
                key={row.date}
                className="trends-mobile-card"
                role="listitem"
                aria-label={`${formatDayLabel(row.date)}: Net ${row.net.toLocaleString()} kilocalories`}
              >
                <div className="trends-mobile-card-header">
                  <h4 className="trends-mobile-card-date">{formatDayLabel(row.date)}</h4>
                  <span
                    className="trends-mobile-card-net"
                    style={{ color: row.net >= 0 ? '#dc2626' : '#059669' }}
                  >
                    {row.net >= 0 ? '+' : ''}{row.net.toLocaleString()} kcal
                  </span>
                </div>
                <div className="trends-mobile-card-fields">
                  <div className="trends-mobile-card-field">
                    <p className="trends-mobile-card-field-label">Intake</p>
                    <p className="trends-mobile-card-field-value">{row.intakeCalories.toLocaleString()} kcal</p>
                  </div>
                  <div className="trends-mobile-card-field">
                    <p className="trends-mobile-card-field-label">BMR</p>
                    <p className="trends-mobile-card-field-value">{row.bmr.toLocaleString()} kcal</p>
                  </div>
                  <div className="trends-mobile-card-field">
                    <p className="trends-mobile-card-field-label">Activity</p>
                    <p className="trends-mobile-card-field-value">{row.activityCalories.toLocaleString()} kcal</p>
                  </div>
                  <div className="trends-mobile-card-field">
                    <p className="trends-mobile-card-field-label">Total Output</p>
                    <p className="trends-mobile-card-field-value">{row.totalOutput.toLocaleString()} kcal</p>
                  </div>
                  <div className="trends-mobile-card-delta">
                    <p className="trends-mobile-card-delta-label">Δ Net</p>
                    <span
                      className="trends-mobile-card-delta-value"
                      style={{ color: deltaColor(row.netDelta) }}
                    >
                      {formatDelta(row.netDelta)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {rows.length > 0 && (
            <TrendSummaryCards summary={summary} summaryId={summaryId} />
          )}
        </>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="trends-table" aria-describedby={rows.length > 0 ? summaryId : undefined}>
              <caption className="trends-table-caption">
                Daily net energy breakdown with period totals and averages
              </caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Intake</th>
                  <th scope="col">BMR</th>
                  <th scope="col">Activity</th>
                  <th scope="col">Total Output</th>
                  <th scope="col">Net</th>
                  <th scope="col">Δ Net</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.date}>
                    <th scope="row">{formatDayLabel(row.date)}</th>
                    <td>{row.intakeCalories.toLocaleString()}</td>
                    <td>{row.bmr.toLocaleString()}</td>
                    <td>{row.activityCalories.toLocaleString()}</td>
                    <td>{row.totalOutput.toLocaleString()}</td>
                    <td>{row.net.toLocaleString()}</td>
                    <td style={{ color: deltaColor(row.netDelta), fontWeight: 600 }}>
                      {formatDelta(row.netDelta)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {rows.length > 0 && (
                <tfoot id={summaryId} aria-label="Period summary">
                  <tr className="trends-table-summary trends-table-summary-total">
                    <th scope="row">Period total</th>
                    <td>{summary.intakeTotal.toLocaleString()}</td>
                    <td>{summary.bmrTotal.toLocaleString()}</td>
                    <td>{summary.activityTotal.toLocaleString()}</td>
                    <td>{summary.totalOutputTotal.toLocaleString()}</td>
                    <td>{summary.netTotal.toLocaleString()}</td>
                    <td aria-hidden="true">—</td>
                  </tr>
                  <tr className="trends-table-summary trends-table-summary-average">
                    <th scope="row">Daily average</th>
                    <td>{summary.intakeAverage.toLocaleString()}</td>
                    <td>{summary.bmrAverage.toLocaleString()}</td>
                    <td>{summary.activityAverage.toLocaleString()}</td>
                    <td>{summary.totalOutputTotal.toLocaleString()}</td>
                    <td>{summary.netAverage.toLocaleString()}</td>
                    <td aria-hidden="true">—</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {rows.length > 0 && (
            <TrendSummaryCards summary={summary} summaryId={summaryId} />
          )}
        </>
      )}
    </div>
  )
}
