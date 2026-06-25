import type { ReactNode } from 'react'
import { iconTileMd, modalSubtitle, modalTitle } from '../../lib/styles'

interface CatalogModalHeaderProps {
  icon: string
  iconBg: string
  iconColor: string
  title: ReactNode
  titleId?: string
  subtitle?: ReactNode
  description?: ReactNode
  marginBottom?: number
}

export default function CatalogModalHeader({
  icon,
  iconBg,
  iconColor,
  title,
  titleId,
  subtitle,
  description,
  marginBottom = 20,
}: CatalogModalHeaderProps) {
  const TitleTag = titleId ? 'h3' : 'div'

  return (
    <div style={{ marginBottom }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ ...iconTileMd, background: iconBg }}>
          <i className={`fa-solid ${icon}`} style={{ color: iconColor, fontSize: 20 }} aria-hidden />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <TitleTag id={titleId} style={modalTitle}>
            {title}
          </TitleTag>
          {subtitle && <p style={modalSubtitle}>{subtitle}</p>}
        </div>
      </div>
      {description && (
        <p style={{ fontSize: 13, color: '#52525b', margin: '14px 0 0 0', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>
  )
}