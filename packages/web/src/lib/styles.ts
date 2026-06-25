import type { CSSProperties } from 'react'

/**
 * Shared inline-style tokens. These are intentionally CSSProperties (not
 * Tailwind classes) so the audit-deduped components can keep their original
 * visuals with a minimum change. If/when the project migrates to a Tailwind
 * design system, these become the single source of truth for the equivalent
 * utility classes.
 */
export const cardSurface: CSSProperties = {
  background: 'white',
  border: '1px solid #e4e4e7',
  borderRadius: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}

export const subtleSurface: CSSProperties = {
  background: '#fafafa',
  border: '1px solid #e4e4e7',
  borderRadius: 20,
}

export const iconTileSm: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

export const iconTileMd: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

export const sectionHeader: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '1.5px',
  color: '#134e4b',
  textTransform: 'uppercase',
  margin: '0 0 4px 0',
}

export const pageTitle: CSSProperties = {
  fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
  fontSize: 36,
  margin: 0,
  fontWeight: 600,
  letterSpacing: '-0.03em',
}

export const pill: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 9999,
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
}

export const primaryButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  background: '#134e4b',
  color: 'white',
  border: 'none',
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  flexShrink: 0,
}

export const inputBase: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e4e4e7',
  borderRadius: 12,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

export const labelBase: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#52525b',
  display: 'block',
  marginBottom: 6,
}

export const modalTitle: CSSProperties = {
  fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
  fontSize: 22,
  fontWeight: 600,
  margin: 0,
  letterSpacing: '-0.02em',
}

export const modalSubtitle: CSSProperties = {
  fontSize: 12,
  color: '#71717a',
  margin: '4px 0 0 0',
}

export const catalogItemCard: CSSProperties = {
  padding: '14px 16px',
  borderRadius: 16,
  border: '1px solid #e4e4e7',
  background: '#fafafa',
}

export const summaryPanel: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: '#ecfdf5',
  color: '#065f46',
  fontSize: 13,
}

export const modalFooterButton: CSSProperties = {
  padding: '10px 20px',
  borderRadius: 9999,
  border: '1px solid #e4e4e7',
  background: 'white',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  color: '#52525b',
}

export const modalPrimaryButton: CSSProperties = {
  padding: '10px 20px',
  borderRadius: 9999,
  border: 'none',
  background: '#134e4b',
  color: 'white',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}
