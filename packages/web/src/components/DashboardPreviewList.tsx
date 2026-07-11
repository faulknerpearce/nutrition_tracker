import type { ReactNode } from 'react'
import { cardSurface } from '../lib/styles'

interface DashboardPreviewListProps {
  title: string
  viewAllHref: string
  viewAllLabel: string
  children: ReactNode
}

export default function DashboardPreviewList({
  title,
  viewAllHref,
  viewAllLabel,
  children,
}: DashboardPreviewListProps) {
  return (
    <div
      style={{
        ...cardSurface,
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {title}
        </h3>
        <a
          href={viewAllHref}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--zone-accent)',
            textDecoration: 'none',
          }}
        >
          {viewAllLabel} →
        </a>
      </div>
      {children}
    </div>
  )
}

interface PreviewRowProps {
  primary: string
  /** Line under name (e.g. weight / portion). */
  secondary?: string
  /** Compact right-side meta (activities). Prefer `macros` for food. */
  meta?: string
  /** Full spelled-out macro line under the name (food logs). */
  macros?: string
}

export function PreviewRow({ primary, secondary, meta, macros }: PreviewRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid #f4f4f5',
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{primary}</div>
        {secondary ? (
          <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{secondary}</div>
        ) : null}
        {macros ? (
          <div
            style={{
              fontSize: 12,
              color: '#71717a',
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            {macros}
          </div>
        ) : null}
      </div>
      {meta && !macros ? (
        <div style={{ fontSize: 12, color: '#a1a1aa', flexShrink: 0 }}>{meta}</div>
      ) : null}
    </div>
  )
}

export function PreviewEmpty({ message }: { message: string }) {
  return <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, padding: '8px 0' }}>{message}</p>
}
