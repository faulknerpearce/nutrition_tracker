import {
  fetchActivitiesSharedWithMe,
  fetchEntriesSharedWithMe,
  fetchRecipesSharedWithMe,
  fetchWorkoutsSharedWithMe,
} from './sharing'

const SEEN_KEY = 'nutrition-tracker-shared-seen-at'

export function getSharedSeenAt(): string | null {
  try {
    return localStorage.getItem(SEEN_KEY)
  } catch {
    return null
  }
}

export function markSharedAsSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, new Date().toISOString())
  } catch {
    // ignore storage errors
  }
}

export async function fetchNewSharedCount(): Promise<number> {
  const seenAt = getSharedSeenAt()
  const [recipes, workouts, entries, activities] = await Promise.all([
    fetchRecipesSharedWithMe(),
    fetchWorkoutsSharedWithMe(),
    fetchEntriesSharedWithMe(),
    fetchActivitiesSharedWithMe(),
  ])

  const createdAts = [
    ...recipes.map((item) => item.share.createdAt),
    ...workouts.map((item) => item.share.createdAt),
    ...entries.map((item) => item.share.createdAt),
    ...activities.map((item) => item.share.createdAt),
  ]

  if (!seenAt) return createdAts.length
  return createdAts.filter((createdAt) => createdAt > seenAt).length
}