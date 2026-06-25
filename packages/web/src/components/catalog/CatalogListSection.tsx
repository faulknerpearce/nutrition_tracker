import type { ReactNode } from 'react'
import { labelBase } from '../../lib/styles'

interface CatalogListSectionProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

export default function CatalogListSection({ title, action, children }: CatalogListSectionProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <p style={{ ...labelBase, marginBottom: 0, fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>
          {title}
        </p>
        {action}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}