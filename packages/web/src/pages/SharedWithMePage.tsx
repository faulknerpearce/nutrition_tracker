import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import CatalogRow from '../components/layout/CatalogRow'
import PageHeader from '../components/layout/PageHeader'
import { PageError, PageLoading } from '../components/layout/PageState'
import RecipeViewModal from '../components/RecipeViewModal'
import SharedActivityViewModal from '../components/SharedActivityViewModal'
import SharedEntryViewModal from '../components/SharedEntryViewModal'
import WorkoutViewModal from '../components/WorkoutViewModal'
import { useProfile } from '../context/useProfile'
import { iconForActivityType } from '../lib/activityIcons'
import { forkActivity } from '../lib/activities'
import { forkEntry } from '../lib/entries'
import { forkRecipe } from '../lib/recipes'
import { getSharedSeenAt, isShareNew, markSharedAsSeen } from '../lib/sharedNotifications'
import {
  dismissActivityShare,
  dismissEntryShare,
  dismissRecipeShare,
  dismissWorkoutShare,
  fetchActivitiesSharedWithMe,
  fetchEntriesSharedWithMe,
  fetchRecipesSharedWithMe,
  fetchWorkoutsSharedWithMe,
  type SharedActivityItem,
  type SharedEntryItem,
  type SharedRecipeItem,
  type SharedWorkoutItem,
} from '../lib/sharing'
import { forkWorkout } from '../lib/workouts'

function SharedSection({
  title,
  count,
  emptyMessage,
  children,
}: {
  title: string
  count: number
  emptyMessage: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px 0', color: '#3f3f46' }}>
        {title} ({count})
      </h2>
      {count === 0 ? (
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 16,
            border: '1px solid #e4e4e7',
            background: '#fafafa',
            color: '#a1a1aa',
            fontSize: 13,
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </section>
  )
}

function SharedCatalogActions({
  resourceLabel,
  onView,
  onDismiss,
  dismissing,
  onPrimary,
  primaryDisabled,
  primaryDone,
  primaryLoading,
  primaryDoneLabel,
  primaryActionLabel,
  primaryIconClass,
}: {
  resourceLabel: string
  onView: () => void
  onDismiss: () => void
  dismissing: boolean
  onPrimary: () => void
  primaryDisabled: boolean
  primaryDone: boolean
  primaryLoading: boolean
  primaryDoneLabel: string
  primaryActionLabel: string
  primaryIconClass: string
}) {
  const primaryTitle = primaryDone
    ? primaryDoneLabel
    : primaryLoading
      ? `${primaryActionLabel}...`
      : primaryActionLabel

  return (
    <>
      <button
        type="button"
        className="delicate-icon-action"
        onClick={onView}
        aria-label={`View ${resourceLabel}`}
        title={`View ${resourceLabel}`}
      >
        <i className="fa-regular fa-eye" />
      </button>
      <button
        type="button"
        className="delicate-icon-action"
        onClick={onDismiss}
        disabled={dismissing}
        aria-label={`Remove shared ${resourceLabel}`}
        title={`Remove shared ${resourceLabel}`}
      >
        <i className="fa-regular fa-trash-can" />
      </button>
      <button
        type="button"
        className="catalog-add-log-button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        aria-label={primaryTitle}
        title={primaryTitle}
      >
        <i
          className={
            primaryLoading ? 'fa-solid fa-spinner fa-spin' : `fa-solid ${primaryIconClass}`
          }
        />
      </button>
    </>
  )
}

export default function SharedWithMePage() {
  const { profile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<SharedEntryItem[]>([])
  const [recipes, setRecipes] = useState<SharedRecipeItem[]>([])
  const [activities, setActivities] = useState<SharedActivityItem[]>([])
  const [workouts, setWorkouts] = useState<SharedWorkoutItem[]>([])
  const [viewingEntry, setViewingEntry] = useState<SharedEntryItem | null>(null)
  const [viewingRecipe, setViewingRecipe] = useState<SharedRecipeItem | null>(null)
  const [viewingActivity, setViewingActivity] = useState<SharedActivityItem | null>(null)
  const [viewingWorkout, setViewingWorkout] = useState<SharedWorkoutItem | null>(null)
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null)
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null)
  const [savingActivityId, setSavingActivityId] = useState<string | null>(null)
  const [savingWorkoutId, setSavingWorkoutId] = useState<string | null>(null)
  const [dismissingEntryId, setDismissingEntryId] = useState<string | null>(null)
  const [dismissingRecipeId, setDismissingRecipeId] = useState<string | null>(null)
  const [dismissingActivityId, setDismissingActivityId] = useState<string | null>(null)
  const [dismissingWorkoutId, setDismissingWorkoutId] = useState<string | null>(null)
  const [seenAtBaseline] = useState(() => getSharedSeenAt())

  const loadShared = async () => {
    const [sharedEntries, sharedRecipes, sharedActivities, sharedWorkouts] = await Promise.all([
      fetchEntriesSharedWithMe(),
      fetchRecipesSharedWithMe(),
      fetchActivitiesSharedWithMe(),
      fetchWorkoutsSharedWithMe(),
    ])
    setEntries(sharedEntries)
    setRecipes(sharedRecipes)
    setActivities(sharedActivities)
    setWorkouts(sharedWorkouts)
  }

  useEffect(() => {
    loadShared()
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load shared items')
        setLoading(false)
      })

    return () => {
      markSharedAsSeen()
    }
  }, [])

  const isNew = (createdAt: string) => isShareNew(createdAt, seenAtBaseline)

  const totalCount = entries.length + recipes.length + activities.length + workouts.length

  const handleAddSharedEntry = async (item: SharedEntryItem) => {
    setSavingEntryId(item.share.id)
    try {
      await forkEntry(item.entry.id, item.share.id)
      await loadShared()
      setViewingEntry(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry')
    } finally {
      setSavingEntryId(null)
    }
  }

  const handleSaveSharedRecipe = async (item: SharedRecipeItem) => {
    setSavingRecipeId(item.share.id)
    try {
      await forkRecipe(item.recipe.id, item.share.id)
      await loadShared()
      setViewingRecipe(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
    } finally {
      setSavingRecipeId(null)
    }
  }

  const handleAddSharedActivity = async (item: SharedActivityItem) => {
    setSavingActivityId(item.share.id)
    try {
      await forkActivity(item.activity.id, item.share.id)
      await loadShared()
      setViewingActivity(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity')
    } finally {
      setSavingActivityId(null)
    }
  }

  const handleSaveSharedWorkout = async (item: SharedWorkoutItem) => {
    setSavingWorkoutId(item.share.id)
    try {
      await forkWorkout(item.workout.id, item.share.id)
      await loadShared()
      setViewingWorkout(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout')
    } finally {
      setSavingWorkoutId(null)
    }
  }

  const handleDismissEntry = async (item: SharedEntryItem) => {
    setDismissingEntryId(item.share.id)
    setError(null)
    try {
      await dismissEntryShare(item.share.id)
      setEntries((prev) => prev.filter((entry) => entry.share.id !== item.share.id))
      if (viewingEntry?.share.id === item.share.id) setViewingEntry(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove shared meal')
    } finally {
      setDismissingEntryId(null)
    }
  }

  const handleDismissRecipe = async (item: SharedRecipeItem) => {
    setDismissingRecipeId(item.share.id)
    setError(null)
    try {
      await dismissRecipeShare(item.share.id)
      setRecipes((prev) => prev.filter((recipe) => recipe.share.id !== item.share.id))
      if (viewingRecipe?.share.id === item.share.id) setViewingRecipe(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove shared recipe')
    } finally {
      setDismissingRecipeId(null)
    }
  }

  const handleDismissActivity = async (item: SharedActivityItem) => {
    setDismissingActivityId(item.share.id)
    setError(null)
    try {
      await dismissActivityShare(item.share.id)
      setActivities((prev) => prev.filter((activity) => activity.share.id !== item.share.id))
      if (viewingActivity?.share.id === item.share.id) setViewingActivity(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove shared activity')
    } finally {
      setDismissingActivityId(null)
    }
  }

  const handleDismissWorkout = async (item: SharedWorkoutItem) => {
    setDismissingWorkoutId(item.share.id)
    setError(null)
    try {
      await dismissWorkoutShare(item.share.id)
      setWorkouts((prev) => prev.filter((workout) => workout.share.id !== item.share.id))
      if (viewingWorkout?.share.id === item.share.id) setViewingWorkout(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove shared workout')
    } finally {
      setDismissingWorkoutId(null)
    }
  }

  if (loading) return <PageLoading message="Loading shared items..." />
  if (error && totalCount === 0) return <PageError message="Failed to load shared items" detail={error} />

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Shared With Me"
        description="Meals, recipes, activities, and workouts that other people have shared with you."
      />

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 24 }}>
        <SharedSection
          title="Meals"
          count={entries.length}
          emptyMessage="No meals shared with you yet."
        >
          <div className="catalog-list">
            {entries.map((item) => (
              <CatalogRow
                key={item.share.id}
                isNew={isNew(item.share.createdAt)}
                icon={item.entry.icon}
                iconBg={item.entry.iconBg}
                iconColor={item.entry.iconColor}
                title={item.entry.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.entry.calories} kcal`}
                onView={() => setViewingEntry(item)}
                actions={
                  <SharedCatalogActions
                    resourceLabel="meal"
                    onView={() => setViewingEntry(item)}
                    onDismiss={() => handleDismissEntry(item)}
                    dismissing={dismissingEntryId === item.share.id}
                    onPrimary={() => handleAddSharedEntry(item)}
                    primaryDisabled={
                      !!item.share.savedCopyId ||
                      savingEntryId === item.share.id ||
                      dismissingEntryId === item.share.id
                    }
                    primaryDone={!!item.share.savedCopyId}
                    primaryLoading={savingEntryId === item.share.id}
                    primaryDoneLabel="Already added"
                    primaryActionLabel="Add to my log"
                    primaryIconClass="fa-bookmark"
                  />
                }
              />
            ))}
          </div>
        </SharedSection>

        <SharedSection
          title="Recipes"
          count={recipes.length}
          emptyMessage="No recipes shared with you yet."
        >
          <div className="catalog-list">
            {recipes.map((item) => (
              <CatalogRow
                key={item.share.id}
                isNew={isNew(item.share.createdAt)}
                icon={item.recipe.icon}
                iconBg={item.recipe.iconBg}
                iconColor={item.recipe.iconColor}
                title={item.recipe.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.recipe.ingredientCount} ingredients`}
                onView={() => setViewingRecipe(item)}
                actions={
                  <SharedCatalogActions
                    resourceLabel="recipe"
                    onView={() => setViewingRecipe(item)}
                    onDismiss={() => handleDismissRecipe(item)}
                    dismissing={dismissingRecipeId === item.share.id}
                    onPrimary={() => handleSaveSharedRecipe(item)}
                    primaryDisabled={
                      !!item.share.savedCopyId ||
                      savingRecipeId === item.share.id ||
                      dismissingRecipeId === item.share.id
                    }
                    primaryDone={!!item.share.savedCopyId}
                    primaryLoading={savingRecipeId === item.share.id}
                    primaryDoneLabel="Already saved"
                    primaryActionLabel="Save to my library"
                    primaryIconClass="fa-bookmark"
                  />
                }
              />
            ))}
          </div>
        </SharedSection>

        <SharedSection
          title="Activities"
          count={activities.length}
          emptyMessage="No activities shared with you yet."
        >
          <div className="catalog-list">
            {activities.map((item) => {
              const icon = iconForActivityType(item.activity.activityType)
              return (
                <CatalogRow
                  key={item.share.id}
                  isNew={isNew(item.share.createdAt)}
                  icon={icon}
                  iconBg="#ecfdf5"
                  iconColor="#134e4b"
                  title={item.activity.name}
                  subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.activity.activityType}`}
                  onView={() => setViewingActivity(item)}
                  actions={
                    <SharedCatalogActions
                      resourceLabel="activity"
                      onView={() => setViewingActivity(item)}
                      onDismiss={() => handleDismissActivity(item)}
                      dismissing={dismissingActivityId === item.share.id}
                      onPrimary={() => handleAddSharedActivity(item)}
                      primaryDisabled={
                        !!item.share.savedCopyId ||
                        savingActivityId === item.share.id ||
                        dismissingActivityId === item.share.id
                      }
                      primaryDone={!!item.share.savedCopyId}
                      primaryLoading={savingActivityId === item.share.id}
                      primaryDoneLabel="Already added"
                      primaryActionLabel="Add to my log"
                      primaryIconClass="fa-bookmark"
                    />
                  }
                />
              )
            })}
          </div>
        </SharedSection>

        <SharedSection
          title="Workouts"
          count={workouts.length}
          emptyMessage="No workouts shared with you yet."
        >
          <div className="catalog-list">
            {workouts.map((item) => (
              <CatalogRow
                key={item.share.id}
                isNew={isNew(item.share.createdAt)}
                icon={item.workout.icon}
                iconBg={item.workout.iconBg}
                iconColor={item.workout.iconColor}
                title={item.workout.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.workout.exerciseCount} exercises`}
                onView={() => setViewingWorkout(item)}
                actions={
                  <SharedCatalogActions
                    resourceLabel="workout"
                    onView={() => setViewingWorkout(item)}
                    onDismiss={() => handleDismissWorkout(item)}
                    dismissing={dismissingWorkoutId === item.share.id}
                    onPrimary={() => handleSaveSharedWorkout(item)}
                    primaryDisabled={
                      !!item.share.savedCopyId ||
                      savingWorkoutId === item.share.id ||
                      dismissingWorkoutId === item.share.id
                    }
                    primaryDone={!!item.share.savedCopyId}
                    primaryLoading={savingWorkoutId === item.share.id}
                    primaryDoneLabel="Already saved"
                    primaryActionLabel="Save to my library"
                    primaryIconClass="fa-bookmark"
                  />
                }
              />
            ))}
          </div>
        </SharedSection>
      </div>

      {viewingEntry && (
        <SharedEntryViewModal
          item={viewingEntry}
          timeZone={profile.timeZone}
          saving={savingEntryId === viewingEntry.share.id}
          onAddToLog={async () => handleAddSharedEntry(viewingEntry)}
          onClose={() => setViewingEntry(null)}
        />
      )}

      {viewingActivity && (
        <SharedActivityViewModal
          item={viewingActivity}
          timeZone={profile.timeZone}
          saving={savingActivityId === viewingActivity.share.id}
          onAddToLog={async () => handleAddSharedActivity(viewingActivity)}
          onClose={() => setViewingActivity(null)}
        />
      )}

      {viewingRecipe && (
        <RecipeViewModal
          recipeId={viewingRecipe.recipe.id}
          onClose={() => setViewingRecipe(null)}
          mode="shared"
          ownerDisplayName={viewingRecipe.share.ownerDisplayName}
          savedCopyId={viewingRecipe.share.savedCopyId}
          savingCopy={savingRecipeId === viewingRecipe.share.id}
          onSaveCopy={async () => handleSaveSharedRecipe(viewingRecipe)}
        />
      )}

      {viewingWorkout && (
        <WorkoutViewModal
          workoutId={viewingWorkout.workout.id}
          onClose={() => setViewingWorkout(null)}
          mode="shared"
          ownerDisplayName={viewingWorkout.share.ownerDisplayName}
          savedCopyId={viewingWorkout.share.savedCopyId}
          savingCopy={savingWorkoutId === viewingWorkout.share.id}
          onSaveCopy={async () => handleSaveSharedWorkout(viewingWorkout)}
        />
      )}
    </div>
  )
}