export type ZoneId = 'dashboard' | 'inputs' | 'outputs' | 'profile'

/**
 * Zone accents — Outputs is a red-orange burn color; Inputs green and Dashboard blue
 * stay in a similar vividness family.
 */
export const ZONE_CORAL = '#EA4E2E'
export const ZONE_GREEN = '#13A561'
export const ZONE_BLUE = '#568FEB'

/** Darker companions for eyebrows / strong labels (same hue family). */
export const ZONE_CORAL_DEEP = '#C43A1F'
export const ZONE_GREEN_DEEP = '#0E7A48'
export const ZONE_BLUE_DEEP = '#2B5FCF'

/** Sunset warm accent — residual brand (charts, accents). */
export const BRAND_SUNSET = '#FF6B35'

/** Dashboard blue — same chroma family as ZONE_BLUE. */
export const DASHBOARD_SKY_TOP = ZONE_BLUE

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
 * Soft zone atmospheres — light washes, not full-bleed skies.
 * Zone identity comes from accent + subtle page tint, not saturated gradients.
 */
export const zoneGradients: Record<ZoneId, string> = {
  dashboard: `linear-gradient(
    180deg,
    color-mix(in srgb, ${ZONE_BLUE} 11%, #ffffff) 0%,
    #F5F7FB 42%,
    #FAFBFC 100%
  )`,
  /** Fueling — soft green wash (chroma matched to coral) */
  inputs: `linear-gradient(
    180deg,
    color-mix(in srgb, ${ZONE_GREEN} 11%, #ffffff) 0%,
    #F4FAF6 42%,
    #FAFBFC 100%
  )`,
  /** Burning — soft coral wash */
  outputs: `linear-gradient(
    180deg,
    color-mix(in srgb, ${ZONE_CORAL} 11%, #ffffff) 0%,
    #FFF8F5 42%,
    #FAFBFC 100%
  )`,
  profile: `linear-gradient(
    180deg,
    #F0F0F2 0%,
    #F7F7F8 50%,
    #FAFAFA 100%
  )`,
}

/**
 * Page chrome on light atmospheres — dark readable text (no white-on-sky).
 * CSS vars keep the historic `--zone-on-sky*` names for compatibility.
 */
export const onSky = {
  text: neutrals.textPrimary,
  textMuted: neutrals.textMuted,
  textFaint: neutrals.textFaint,
  shadow: 'none',
  shadowStrong: 'none',
} as const

/** Frosted glass surfaces for layered chrome (nav, docks, menus). */
export const glass = {
  bg: 'rgba(255, 255, 255, 0.72)',
  bgStrong: 'rgba(255, 255, 255, 0.82)',
  bgSoft: 'rgba(255, 255, 255, 0.62)',
  border: 'rgba(28, 28, 30, 0.08)',
  borderEdge: 'rgba(28, 28, 30, 0.08)',
  blur: '16px',
  shadow: '0 8px 28px rgba(28, 28, 30, 0.08)',
  shadowSoft: '0 4px 16px rgba(28, 28, 30, 0.06)',
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
    accent: ZONE_BLUE,
    accentMuted: 'rgba(86, 143, 235, 0.14)',
    accentText: '#ffffff',
    bg: zoneGradients.dashboard,
    cardBg: neutrals.surface,
    cardBorder: 'rgba(86, 143, 235, 0.14)',
    eyebrow: ZONE_BLUE_DEEP,
    onSky: onSky.text,
    onSkyMuted: onSky.textMuted,
  },
  inputs: {
    id: 'inputs',
    // Fuel / nourish — green matched to coral S/L
    accent: ZONE_GREEN,
    accentMuted: 'rgba(19, 165, 97, 0.14)',
    accentText: '#ffffff',
    bg: zoneGradients.inputs,
    cardBg: neutrals.surface,
    cardBorder: 'rgba(19, 165, 97, 0.16)',
    eyebrow: ZONE_GREEN_DEEP,
    onSky: onSky.text,
    onSkyMuted: onSky.textMuted,
  },
  outputs: {
    id: 'outputs',
    // Burn / effort — reference coral
    accent: ZONE_CORAL,
    accentMuted: 'rgba(232, 106, 60, 0.14)',
    accentText: '#ffffff',
    bg: zoneGradients.outputs,
    cardBg: neutrals.surface,
    cardBorder: 'rgba(232, 106, 60, 0.14)',
    eyebrow: ZONE_CORAL_DEEP,
    onSky: onSky.text,
    onSkyMuted: onSky.textMuted,
  },
  profile: {
    id: 'profile',
    accent: '#4A4A58',
    accentMuted: 'rgba(74, 74, 88, 0.1)',
    accentText: '#ffffff',
    bg: zoneGradients.profile,
    cardBg: neutrals.surface,
    cardBorder: 'rgba(28, 28, 30, 0.08)',
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
    '--zone-on-sky-shadow-strong': onSky.shadowStrong,
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
