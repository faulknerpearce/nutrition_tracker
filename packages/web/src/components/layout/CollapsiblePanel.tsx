import { useState, type ReactNode } from 'react'
import { cardSurface } from '../../lib/styles'

interface CollapsiblePanelProps {
  title: string
  subtitle?: string
  defaultExpanded?: boolean
  children: ReactNode
}

export default function CollapsiblePanel({
  title,
  subtitle,
  defaultExpanded = false,
  children,
}: CollapsiblePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div style={{ ...cardSurface, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="log-section-header-toggle"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: '20px 24px',
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#71717a', fontWeight: 500, marginBottom: 4 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: '#a1a1aa' }}>{subtitle}</div>}
        </div>
        <i
          className="fa-solid fa-chevron-down"
          style={{
            color: '#71717a',
            fontSize: 14,
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: 16,
          }}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="log-section-content" style={{ padding: '0 24px 24px', borderTop: '1px solid #f4f4f5' }}>
          {children}
        </div>
      )}
    </div>
  )
}