import { formatDayLabel } from '@nutrition-tracker/shared'
import type { ReactNode } from 'react'

interface DayNavigatorProps {
  date: string
  meta?: ReactNode
  itemCount?: number
  itemLabel?: { singular: string; plural: string }
  canGoBack?: boolean
  canGoForward?: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function DayNavigator({
  date,
  meta,
  itemCount = 0,
  itemLabel = { singular: 'entry', plural: 'entries' },
  canGoBack = true,
  canGoForward = false,
  onPrevious,
  onNext,
}: DayNavigatorProps) {
  const defaultMeta = `${itemCount} ${itemCount === 1 ? itemLabel.singular : itemLabel.plural}`

  return (
    <div className={`inputs-day-nav${canGoForward ? '' : ' inputs-day-nav-today'}`}>
      <button
        type="button"
        className="inputs-day-nav-button"
        onClick={onPrevious}
        disabled={!canGoBack}
        aria-label="Previous day"
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>

      <div className="inputs-day-nav-label">
        <div className="inputs-day-nav-title">{formatDayLabel(date)}</div>
        <div className="inputs-day-nav-date">{date}</div>
        <div className="inputs-day-nav-meta">{meta ?? defaultMeta}</div>
      </div>

      <button
        type="button"
        className="inputs-day-nav-button"
        onClick={onNext}
        disabled={!canGoForward}
        aria-label="Next day"
      >
        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </button>
    </div>
  )
}