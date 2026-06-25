export interface IconOption {
  icon: string
  label: string
  bg: string
  color: string
}

export const DEFAULT_ICON = 'fa-utensils'
export const DEFAULT_ICON_BG = '#f4f4f5'
export const DEFAULT_ICON_COLOR = '#71717a'

/** Icons for food entries and recipes — aligned with nutrition tracking. */
export const foodIconOptions: readonly IconOption[] = [
  { icon: 'fa-utensils', label: 'Meal', bg: '#f4f4f5', color: '#52525b' },
  { icon: 'fa-bowl-food', label: 'Bowl', bg: '#f4f4f5', color: '#71717a' },
  { icon: 'fa-plate-wheat', label: 'Plate', bg: '#fef3c7', color: '#d97706' },
  { icon: 'fa-fire', label: 'Calories', bg: '#fed7aa', color: '#ea580c' },
  { icon: 'fa-dumbbell', label: 'Protein', bg: '#d1fae5', color: '#059669' },
  { icon: 'fa-wheat-awn', label: 'Carbs', bg: '#fef3c7', color: '#d97706' },
  { icon: 'fa-bacon', label: 'Fat', bg: '#fce7f3', color: '#db2777' },
  { icon: 'fa-seedling', label: 'Fiber', bg: '#ecfccb', color: '#65a30d' },
  { icon: 'fa-mug-hot', label: 'Caffeine', bg: '#ede9fe', color: '#7c3aed' },
  { icon: 'fa-glass-water', label: 'Water', bg: '#e0f2fe', color: '#0284c7' },
  { icon: 'fa-blender', label: 'Smoothie', bg: '#ecfeff', color: '#0d9488' },
  { icon: 'fa-apple-whole', label: 'Fruit', bg: '#fef9c3', color: '#ca8a04' },
  { icon: 'fa-carrot', label: 'Vegetables', bg: '#ffedd5', color: '#ea580c' },
  { icon: 'fa-egg', label: 'Eggs', bg: '#fef9c3', color: '#ca8a04' },
  { icon: 'fa-fish', label: 'Fish', bg: '#dbeafe', color: '#2563eb' },
  { icon: 'fa-drumstick-bite', label: 'Poultry', bg: '#fee2e2', color: '#dc2626' },
  { icon: 'fa-cheese', label: 'Dairy', bg: '#fef3c7', color: '#d97706' },
  { icon: 'fa-bread-slice', label: 'Bread', bg: '#fef3c7', color: '#b45309' },
  { icon: 'fa-bowl-rice', label: 'Grains', bg: '#f5f5f4', color: '#78716c' },
  { icon: 'fa-chart-pie', label: 'Macros', bg: '#ccfbf1', color: '#134e4b' },
]

/** @deprecated Alias for foodIconOptions */
export const iconOptions = foodIconOptions

/** Icons for workout templates — aligned with activity outputs. */
export const workoutIconOptions: readonly IconOption[] = [
  { icon: 'fa-dumbbell', label: 'Strength', bg: '#ecfdf5', color: '#134e4b' },
  { icon: 'fa-heart-pulse', label: 'Cardio', bg: '#fee2e2', color: '#dc2626' },
  { icon: 'fa-person-running', label: 'Run', bg: '#dbeafe', color: '#2563eb' },
  { icon: 'fa-person-biking', label: 'Cycle', bg: '#e0f2fe', color: '#0284c7' },
  { icon: 'fa-person-swimming', label: 'Swim', bg: '#ecfeff', color: '#0d9488' },
  { icon: 'fa-person-walking', label: 'Walk', bg: '#f4f4f5', color: '#52525b' },
  { icon: 'fa-weight-hanging', label: 'Weights', bg: '#fef3c7', color: '#d97706' },
  { icon: 'fa-fire', label: 'Burn', bg: '#fed7aa', color: '#ea580c' },
  { icon: 'fa-bolt', label: 'HIIT', bg: '#fef9c3', color: '#ca8a04' },
  { icon: 'fa-stopwatch', label: 'Timed', bg: '#ede9fe', color: '#7c3aed' },
  { icon: 'fa-shoe-prints', label: 'Steps', bg: '#f5f5f4', color: '#78716c' },
  { icon: 'fa-mountain', label: 'Hike', bg: '#dcfce7', color: '#16a34a' },
  { icon: 'fa-spa', label: 'Mobility', bg: '#ecfccb', color: '#65a30d' },
  { icon: 'fa-clock', label: 'Duration', bg: '#ccfbf1', color: '#134e4b' },
]

export const DEFAULT_WORKOUT_ICON_OPTION = workoutIconOptions[0]