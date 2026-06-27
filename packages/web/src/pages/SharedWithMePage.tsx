import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import CatalogRow from '../components/layout/CatalogRow'
import PageHeader from '../components/layout/PageHeader'
import { PageError, PageLoading } from '../components/layout/PageState'
import ZoneButton from '../components/layout/ZoneButton'
import RecipeViewModal from '../components/RecipeViewModal'
import SharedActivityViewModal from '../components/SharedActivityViewModal'
import SharedEntryViewModal from '../components/SharedEntryViewModal'
import WorkoutViewModal from '../components/WorkoutViewModal'
import { useProfile } from '../context/useProfile'
import { iconForActivityType } from '../lib/activityIcons'
import { forkActivity } from '../lib/activities'
import { forkEntry } from '../lib/entries'
import { forkRecipe } from '../lib/recipes'
import { markSharedAsSeen } from '../lib/sharedNotifications'
import {
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
    markSharedAsSeen()
    loadShared()
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load shared items')
        setLoading(false)
      })
  }, [])

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
                icon={item.entry.icon}
                iconBg={item.entry.iconBg}
                iconColor={item.entry.iconColor}
                title={item.entry.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.entry.calories} kcal`}
                onView={() => setViewingEntry(item)}
                actions={
                  <>
                    <ZoneButton onClick={() => setViewingEntry(item)}>View</ZoneButton>
                    <ZoneButton
                      variant="primary"
                      onClick={() => handleAddSharedEntry(item)}
                      disabled={!!item.share.savedCopyId || savingEntryId === item.share.id}
                    >
                      {item.share.savedCopyId
                        ? 'Already added'
                        : savingEntryId === item.share.id
                          ? 'Adding...'
                          : 'Add to my log'}
                    </ZoneButton>
                  </>
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
                icon={item.recipe.icon}
                iconBg={item.recipe.iconBg}
                iconColor={item.recipe.iconColor}
                title={item.recipe.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.recipe.ingredientCount} ingredients`}
                onView={() => setViewingRecipe(item)}
                actions={
                  <>
                    <ZoneButton onClick={() => setViewingRecipe(item)}>View</ZoneButton>
                    <ZoneButton
                      variant="primary"
                      onClick={() => handleSaveSharedRecipe(item)}
                      disabled={!!item.share.savedCopyId || savingRecipeId === item.share.id}
                    >
                      {item.share.savedCopyId
                        ? 'Already saved'
                        : savingRecipeId === item.share.id
                          ? 'Saving...'
                          : 'Save to my library'}
                    </ZoneButton>
                  </>
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
                  icon={icon}
                  iconBg="#ecfdf5"
                  iconColor="#134e4b"
                  title={item.activity.name}
                  subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.activity.activityType}`}
                  onView={() => setViewingActivity(item)}
                  actions={
                    <>
                      <ZoneButton onClick={() => setViewingActivity(item)}>View</ZoneButton>
                      <ZoneButton
                        variant="primary"
                        onClick={() => handleAddSharedActivity(item)}
                        disabled={!!item.share.savedCopyId || savingActivityId === item.share.id}
                      >
                        {item.share.savedCopyId
                          ? 'Already added'
                          : savingActivityId === item.share.id
                            ? 'Adding...'
                            : 'Add to my log'}
                      </ZoneButton>
                    </>
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
                icon={item.workout.icon}
                iconBg={item.workout.iconBg}
                iconColor={item.workout.iconColor}
                title={item.workout.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.workout.exerciseCount} exercises`}
                onView={() => setViewingWorkout(item)}
                actions={
                  <>
                    <ZoneButton onClick={() => setViewingWorkout(item)}>View</ZoneButton>
                    <ZoneButton
                      variant="primary"
                      onClick={() => handleSaveSharedWorkout(item)}
                      disabled={!!item.share.savedCopyId || savingWorkoutId === item.share.id}
                    >
                      {item.share.savedCopyId
                        ? 'Already saved'
                        : savingWorkoutId === item.share.id
                          ? 'Saving...'
                          : 'Save to my library'}
                    </ZoneButton>
                  </>
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