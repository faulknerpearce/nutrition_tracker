export interface IconOption {
  icon: string
  label: string
  bg: string
  color: string
}

export const DEFAULT_ICON = 'fa-utensils'
export const DEFAULT_ICON_BG = '#f4f4f5'
export const DEFAULT_ICON_COLOR = '#71717a'

export const iconOptions: readonly IconOption[] = [
  { icon: 'fa-coffee', label: 'Coffee', bg: '#fef3c7', color: '#d97706' },
  { icon: 'fa-leaf', label: 'Plant', bg: '#dcfce7', color: '#16a34a' },
  { icon: 'fa-mug-hot', label: 'Hot drink', bg: '#fee2e2', color: '#e11d48' },
  { icon: 'fa-blender', label: 'Shake', bg: '#e0f2fe', color: '#0284c8' },
  { icon: 'fa-apple-alt', label: 'Fruit', bg: '#fef9c3', color: '#ca8a04' },
  { icon: 'fa-candy-cane', label: 'Treat', bg: '#f3e8ff', color: '#9333ea' },
  { icon: 'fa-drumstick-bite', label: 'Meat', bg: '#fee2e2', color: '#dc2626' },
  { icon: 'fa-bread-slice', label: 'Bread', bg: '#fef3c7', color: '#d97706' },
  { icon: 'fa-egg', label: 'Eggs', bg: '#fef9c3', color: '#ca8a04' },
  { icon: 'fa-wine-bottle', label: 'Bottle', bg: '#e0f2fe', color: '#0284c8' },
]
