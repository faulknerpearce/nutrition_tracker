export const activityTypeIcons: Record<string, string> = {
  Run: 'fa-person-running',
  Ride: 'fa-person-biking',
  Swim: 'fa-person-swimming',
  Walk: 'fa-person-walking',
  Hike: 'fa-mountain',
  Workout: 'fa-dumbbell',
  Other: 'fa-heart-pulse',
}

export function iconForActivityType(activityType: string): string {
  return activityTypeIcons[activityType] ?? activityTypeIcons.Other
}