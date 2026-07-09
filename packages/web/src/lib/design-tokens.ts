export type ZoneId = 'dashboard' | 'inputs' | 'outputs' | 'profile'

/** Sunset warm accent — primary brand for dashboard / center nav. */
export const BRAND_SUNSET = '#FF6B35'

/** @deprecated Use BRAND_SUNSET — kept as alias for any remaining imports. */
export const BRAND_BLUE = BRAND_SUNSET

/** Golden-hour neutrals (iOS-like secondary labels). */
export const neutrals = {
  textPrimary: '#1C1C1E',
  textSecondary: '#3A3A3C',
  textMuted: '#6C6C70',
  textSubtle: '#6C6C70',
  textFaint: '#8E8E93',
  border: 'rgba(28, 28, 30, 0.08)',
  borderStrong: 'rgba(28, 28, 30, 0.12)',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFBFC',
  surfaceHover: '#F4F4F5',
  pageBg: '#FAFBFC',
} as const

/** Semantic status (alerts) — slightly softened for wellness feel. */
export const status = {
  danger: {
    text: '#FF453A',
    textStrong: '#D70015',
    bg: '#FFF1F0',
    border: '#FFC9C5',
  },
  success: {
    text: '#34C759',
    textStrong: '#248A3D',
    bg: '#EAF9EE',
    border: '#B6EBC5',
  },
  warning: {
    text: '#FF9F0A',
    textStrong: '#C93400',
    bg: '#FFF6E5',
    border: '#FFE0A3',
  },
  info: {
    text: '#5AC8FA',
    textStrong: '#007AFF',
    bg: '#EAF6FF',
    border: '#B8E0FA',
  },
} as const

/**
 * Radius scale (px).
 * Elevated cards use `xxl` (28) — reference style.
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 9999,
} as const

/** Shadow scale. */
export const shadow = {
  none: 'none',
  soft: '0 4px 16px rgba(28, 28, 30, 0.06)',
  elevated: '0 14px 36px rgba(28, 28, 30, 0.10)',
  modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const

export const type = {
  eyebrow: 11,
  caption: 12,
  bodySm: 13,
  body: 14,
  titleSm: 20,
  titleMd: 22,
  titleLg: 28,
  titleXl: 32,
  display: 36,
  hero: 52,
} as const

/** Atmosphere: grain + gradient status bars. */
export const atmosphere = {
  grainOpacity: 0.07,
  accentDots: ['#FF6B35', '#FF8C5A', '#B07B9E'] as const,
  gradients: {
    warmCool: 'linear-gradient(90deg, #FF6B35, #5AC8FA)',
    dangerCool: 'linear-gradient(90deg, #FF453A, #64D2FF)',
    goldenSky: 'linear-gradient(90deg, #FFD700, #64D2FF)',
    peach: 'linear-gradient(90deg, #FF9F5C, #FFDB85)',
    cool: 'linear-gradient(90deg, #5AC8FA, #007AFF)',
  },
} as const

/**
 * Per-zone sky gradients (top → bottom).
 * Tops stay deep enough for white chrome text; bottoms soften into cream/mist.
 */
export const zoneGradients: Record<ZoneId, string> = {
  dashboard: `linear-gradient(
    165deg,
    #3D4F7A 0%,
    #6B8DB5 18%,
    #B8D4E8 40%,
    #E8B48A 58%,
    #FF9F5C 78%,
    #FFDB85 100%
  )`,
  /** Clear peach sunrise — no muddy brown tops */
  inputs: `linear-gradient(
    165deg,
    #E86A3C 0%,
    #FF8F5A 18%,
    #FFB07A 38%,
    #FFD0A8 58%,
    #FFE8D4 80%,
    #FFF8F2 100%
  )`,
  outputs: `linear-gradient(
    165deg,
    #1E3A4C 0%,
    #2F6F7E 20%,
    #5BA3B0 42%,
    #A8D5D0 65%,
    #D4EDE8 85%,
    #F0F7F5 100%
  )`,
  profile: `linear-gradient(
    165deg,
    #3C3C48 0%,
    #5C5C6E 22%,
    #8A8A9C 48%,
    #C5C5D0 72%,
    #E8E8EE 90%,
    #F5F5F7 100%
  )`,
}

/** Text that sits directly on the zone sky (not inside white cards). */
export const onSky = {
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.86)',
  textFaint: 'rgba(255, 255, 255, 0.72)',
  shadow: '0 1px 2px rgba(0, 0, 0, 0.28), 0 0 18px rgba(0, 0, 0, 0.12)',
} as const

export interface ZoneTokens {
  id: ZoneId
  accent: string
  accentMuted: string
  accentText: string
  /** Full CSS background (gradient) for page atmosphere. */
  bg: string
  cardBg: string
  cardBorder: string
  /** Eyebrow color inside white cards / chrome that sits on white. */
  eyebrow: string
  /** Page-level labels on the sky gradient. */
  onSky: string
  onSkyMuted: string
}

export const zoneTokens: Record<ZoneId, ZoneTokens> = {
  dashboard: {
    id: 'dashboard',
    accent: BRAND_SUNSET,
    accentMuted: 'rgba(255, 107, 53, 0.16)',
    accentText: '#ffffff',
    bg: zoneGradients.dashboard,
    cardBg: neutrals.surface,
    cardBorder: 'rgba(28, 28, 30, 0.06)',
    eyebrow: '#8B5A3C',
    onSky: onSky.text,
    onSkyMuted: onSky.textMuted,
  },
  inputs: {
    id: 'inputs',
    accent: '#E86A3C',
    accentMuted: 'rgba(232, 106, 60, 0.16)',
    accentText: '#ffffff',
    bg: zoneGradients.inputs,
    cardBg: neutrals.surface,
    cardBorder: 'rgba(28, 28, 30, 0.06)',
    eyebrow: '#C45A2A',
    onSky: onSky.text,
    onSkyMuted: onSky.textMuted,
  },
  outputs: {
    id: 'outputs',
    accent: '#2F8A9B',
    accentMuted: 'rgba(47, 138, 155, 0.16)',
    accentText: '#ffffff',
    bg: zoneGradients.outputs,
    cardBg: neutrals.surface,
    cardBorder: 'rgba(28, 28, 30, 0.06)',
    eyebrow: '#1E5A66',
    onSky: onSky.text,
    onSkyMuted: onSky.textMuted,
  },
  profile: {
    id: 'profile',
    accent: '#4A4A58',
    accentMuted: 'rgba(74, 74, 88, 0.12)',
    accentText: '#ffffff',
    bg: zoneGradients.profile,
    cardBg: neutrals.surface,
    cardBorder: 'rgba(28, 28, 30, 0.06)',
    eyebrow: '#5C5C6E',
    onSky: onSky.text,
    onSkyMuted: onSky.textMuted,
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
    '--zone-on-sky': zone.onSky,
    '--zone-on-sky-muted': zone.onSkyMuted,
    '--zone-on-sky-shadow': onSky.shadow,
  }
}

export function globalCssVars(): Record<string, string> {
  return {
    '--color-text-primary': neutrals.textPrimary,
    '--color-text-secondary': neutrals.textSecondary,
    '--color-text-muted': neutrals.textMuted,
    '--color-text-subtle': neutrals.textSubtle,
    '--color-text-faint': neutrals.textFaint,
    '--color-border': neutrals.border,
    '--color-border-strong': neutrals.borderStrong,
    '--color-surface': neutrals.surface,
    '--color-surface-muted': neutrals.surfaceMuted,
    '--color-surface-hover': neutrals.surfaceHover,
    '--color-page-bg': neutrals.pageBg,
    '--color-danger': status.danger.text,
    '--color-danger-strong': status.danger.textStrong,
    '--color-danger-bg': status.danger.bg,
    '--color-danger-border': status.danger.border,
    '--color-success': status.success.text,
    '--color-success-strong': status.success.textStrong,
    '--color-success-bg': status.success.bg,
    '--color-success-border': status.success.border,
    '--color-warning': status.warning.text,
    '--color-warning-strong': status.warning.textStrong,
    '--color-warning-bg': status.warning.bg,
    '--color-warning-border': status.warning.border,
    '--color-info': status.info.text,
    '--color-info-strong': status.info.textStrong,
    '--color-info-bg': status.info.bg,
    '--color-info-border': status.info.border,
    '--radius-sm': `${radius.sm}px`,
    '--radius-md': `${radius.md}px`,
    '--radius-lg': `${radius.lg}px`,
    '--radius-xl': `${radius.xl}px`,
    '--radius-xxl': `${radius.xxl}px`,
    '--radius-pill': `${radius.pill}px`,
    '--shadow-soft': shadow.soft,
    '--shadow-elevated': shadow.elevated,
    '--shadow-modal': shadow.modal,
    '--brand-sunset': BRAND_SUNSET,
    '--nav-center-blue': BRAND_SUNSET,
  }
}
