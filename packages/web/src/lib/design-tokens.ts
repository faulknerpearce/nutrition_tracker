export type ZoneId = 'dashboard' | 'inputs' | 'outputs' | 'profile'

/** Brand blue — dashboard hero and center nav button only. */
export const BRAND_BLUE = '#2b68e8'

export interface ZoneTokens {
  id: ZoneId
  accent: string
  accentMuted: string
  accentText: string
  bg: string
  cardBg: string
  cardBorder: string
  eyebrow: string
}

export const zoneTokens: Record<ZoneId, ZoneTokens> = {
  dashboard: {
    id: 'dashboard',
    accent: BRAND_BLUE,
    accentMuted: '#dbeafe',
    accentText: '#ffffff',
    bg: '#f0f4ff',
    cardBg: '#ffffff',
    cardBorder: '#bfdbfe',
    eyebrow: '#1e40af',
  },
  inputs: {
    id: 'inputs',
    accent: '#d97706',
    accentMuted: '#ffedd5',
    accentText: '#ffffff',
    bg: '#fffbf5',
    cardBg: '#ffffff',
    cardBorder: '#fed7aa',
    eyebrow: '#b45309',
  },
  outputs: {
    id: 'outputs',
    accent: '#0d9488',
    accentMuted: '#ccfbf1',
    accentText: '#ffffff',
    bg: '#f0fdfa',
    cardBg: '#ffffff',
    cardBorder: '#99f6e4',
    eyebrow: '#0f766e',
  },
  profile: {
    id: 'profile',
    accent: '#27272a',
    accentMuted: '#f4f4f5',
    accentText: '#ffffff',
    bg: '#fafafa',
    cardBg: '#ffffff',
    cardBorder: '#e4e4e7',
    eyebrow: '#52525b',
  },
}

export function zoneCssVars(zone: ZoneTokens): Record<string, string> {
  return {
    '--zone-accent': zone.accent,
    '--zone-accent-muted': zone.accentMuted,
    '--zone-accent-text': zone.accentText,
    '--zone-bg': zone.bg,
    '--zone-card-bg': zone.cardBg,
    '--zone-card-border': zone.cardBorder,
    '--zone-eyebrow': zone.eyebrow,
  }
}