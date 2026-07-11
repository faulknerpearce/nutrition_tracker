import { formatDistance, formatDuration } from '@nutrition-tracker/shared'
import { useState } from 'react'
import type { Activity, ActivityWrite } from '../lib/activities'
import { neutrals, radius } from '../lib/design-tokens'
import AddActivityModal from './AddActivityModal'
import ShareModal from './ShareModal'
import { Button, Card, EmptyState } from './ui'

interface ActivityLogSectionProps {
  activities: Activity[]
  logDate: string
  timeZone: string
  onAdd?: (activity: ActivityWrite, options?: { activityDate?: string }) => Promise<void>
  onLogWorkout?: (options: {
    workoutId: string
    setsLogged: number
    loggedAt?: string
    activityDate?: string
  }) => Promise<void>
  onEdit?: (id: string, activity: ActivityWrite) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  title?: string
  subtitle?: string
  defaultExpanded?: boolean
  collapsible?: boolean
  showActions?: boolean
  addFormOpen?: boolean
  onAddFormOpenChange?: (open: boolean) => void
}

const activityIcon: Record<string, string> = {
  Run: 'fa-person-running',
  Ride: 'fa-person-biking',
  Swim: 'fa-person-swimming',
  Walk: 'fa-person-walking',
  Hike: 'fa-mountain',
  Workout: 'fa-dumbbell',
  Other: 'fa-heart-pulse',
}

export default function ActivityLogSection({
  activities,
  logDate,
  timeZone,
  onAdd,
  onLogWorkout,
  onEdit,
  onDelete,
  title = "Today's Activities",
  subtitle,
  defaultExpanded = false,
  collapsible = true,
  showActions = true,
  addFormOpen,
  onAddFormOpenChange,
}: ActivityLogSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const [internalShowAddForm, setInternalShowAddForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [sharingActivity, setSharingActivity] = useState<Activity | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const expanded = collapsible ? internalExpanded : true
  const showAddForm = addFormOpen ?? internalShowAddForm
  const setShowAddForm = onAddFormOpenChange ?? setInternalShowAddForm

  const removeActivity = async (id: string) => {
    if (!onDelete) return
    setDeleting(id)
    try {
      await onDelete(id)
    } catch (err) {
      console.error('Failed to delete activity:', err)
    } finally {
      setDeleting(null)
    }
  }

  const count = activities.length

  const activityList = (
    <>
      {count === 0 ? (
        <EmptyState
          icon="fa-solid fa-heart-pulse"
          title="No activities yet"
          description={
            showActions
              ? 'Click "Log Activity" to record your first workout.'
              : 'Use the button above to record your first workout.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: collapsible ? 20 : 0 }}>
          {activities.map((item) => {
            const icon = activityIcon[item.activityType] ?? activityIcon.Other
            return (
              <div
                key={item.id}
                className="log-entry-card"
                style={{
                  background: neutrals.surfaceMuted,
                  border: `1px solid ${neutrals.border}`,
                  borderRadius: radius.lg,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  opacity: deleting === item.id ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: 'var(--zone-accent-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <i
                    className={`fa-solid ${icon}`}
                    style={{ color: 'var(--zone-accent)', fontSize: 15 }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      <span style={{ fontWeight: 500, color: 'var(--zone-accent)' }}>
                        {formatDuration(item.movingTimeSeconds)}
                      </span>{' '}
                      <span style={{ color: neutrals.textFaint }}>duration</span>
                    </span>
                    <span>
                      <span style={{ fontWeight: 500, color: '#0d9488' }}>{formatDistance(item.distanceMeters)}</span>{' '}
                      <span style={{ color: '#a1a1aa' }}>distance</span>
                    </span>
                    {item.calories !== null && (
                      <span>
                        <span style={{ fontWeight: 500, color: '#ea580c' }}>{item.calories}</span>{' '}
                        <span style={{ color: '#a1a1aa' }}>kcal burned</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="catalog-row-actions">
                  <button
                    type="button"
                    className="delicate-icon-action"
                    onClick={() => setSharingActivity(item)}
                    aria-label="Share activity"
                    title="Share activity"
                  >
                    <i className="fa-regular fa-share-from-square" />
                  </button>
                  {onEdit && (
                    <button
                      type="button"
                      className="delicate-icon-action"
                      onClick={() => setEditingActivity(item)}
                      aria-label="Edit activity"
                      title="Edit activity"
                    >
                      <i className="fa-regular fa-pen-to-square" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="delicate-icon-action"
                      onClick={() => removeActivity(item.id)}
                      disabled={deleting === item.id}
                      aria-label="Remove activity"
                      title="Remove activity"
                    >
                      <i className="fa-regular fa-trash-can" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  const modals = (
    <>
      {showAddForm && onAdd && showActions && (
        <AddActivityModal
          logDate={logDate}
          timeZone={timeZone}
          onAdd={onAdd}
          onLogWorkout={
            onLogWorkout
              ? async (options) => {
                  await onLogWorkout(options)
                  setShowAddForm(false)
                }
              : undefined
          }
          onClose={() => setShowAddForm(false)}
        />
      )}
      {editingActivity && onEdit && (
        <AddActivityModal
          activity={editingActivity}
          logDate={logDate}
          timeZone={timeZone}
          onAdd={async (activity) => {
            await onEdit(editingActivity.id, activity)
            setEditingActivity(null)
          }}
          onClose={() => setEditingActivity(null)}
        />
      )}
      {sharingActivity && (
        <ShareModal
          resourceType="activity"
          resourceId={sharingActivity.id}
          resourceName={sharingActivity.name}
          onClose={() => setSharingActivity(null)}
        />
      )}
    </>
  )

  if (!collapsible) {
    return (
      <>
        {activityList}
        {modals}
      </>
    )
  }

  return (
    <Card tone="neutral">
      <div
        className="log-section-header"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
        }}
      >
        <button
          type="button"
          onClick={() => setInternalExpanded((value) => !value)}
          className="log-section-header-toggle"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0,
            marginRight: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: neutrals.textSubtle,
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 12, color: neutrals.textFaint }}>
              {subtitle ?? 'Chronological order (earliest → latest)'} • {count}{' '}
              {count === 1 ? 'activity' : 'activities'}
            </div>
          </div>
          <i
            className="fa-solid fa-chevron-down"
            style={{
              color: neutrals.textSubtle,
              fontSize: 14,
              transition: 'transform 0.2s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
              marginLeft: 16,
            }}
          />
        </button>
        {onAdd && showActions && (
          <Button
            variant="primary"
            onClick={() => {
              setShowAddForm(true)
              setInternalExpanded(true)
            }}
          >
            <i className="fa-solid fa-plus" style={{ fontSize: 11 }} aria-hidden="true" />
            Log Activity
          </Button>
        )}
      </div>

      {expanded && (
        <div
          className="log-section-content"
          style={{
            padding: '0 24px 24px',
            borderTop: `1px solid ${neutrals.surfaceHover}`,
          }}
        >
          {activityList}
        </div>
      )}

      {modals}
    </Card>
  )
}