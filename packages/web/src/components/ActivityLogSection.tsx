import { formatDistance, formatDuration } from '@nutrition-tracker/shared'
import { useState } from 'react'
import type { Activity, NewActivity } from '../lib/activities'
import AddActivityModal from './AddActivityModal'

interface ActivityLogSectionProps {
  activities: Activity[]
  onAdd?: (activity: NewActivity) => Promise<void>
  onLogWorkout?: (options: { workoutId: string; setsLogged: number }) => Promise<void>
  onEdit?: (id: string, activity: NewActivity) => Promise<void>
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
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a1a1aa' }}>
          <i className="fa-solid fa-heart-pulse" style={{ fontSize: 32, marginBottom: 12, display: 'block' }} />
          <p style={{ fontWeight: 500, margin: '0 0 4px 0', color: '#52525b' }}>No activities yet</p>
          <p style={{ fontSize: 13, margin: 0 }}>
            {showActions
              ? 'Click "Log Activity" to record your first workout.'
              : 'Use the button above to record your first workout.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: collapsible ? 20 : 0 }}>
          {activities.map((item) => {
            const icon = activityIcon[item.activityType] ?? activityIcon.Other
            return (
              <div
                key={item.id}
                className="log-entry-card"
                style={{
                  background: '#fafafa',
                  border: '1px solid #e4e4e7',
                  borderRadius: 20,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  opacity: deleting === item.id ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    background: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <i className={`fa-solid ${icon}`} style={{ color: '#134e4b', fontSize: 20 }} />
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
                      <span style={{ fontWeight: 500, color: '#134e4b' }}>
                        {formatDuration(item.movingTimeSeconds)}
                      </span>{' '}
                      <span style={{ color: '#a1a1aa' }}>duration</span>
                    </span>
                    <span>
                      <span style={{ fontWeight: 500, color: '#2563eb' }}>{formatDistance(item.distanceMeters)}</span>{' '}
                      <span style={{ color: '#a1a1aa' }}>distance</span>
                    </span>
                    {item.calories !== null && (
                      <span>
                        <span style={{ fontWeight: 500, color: '#ea580c' }}>{item.calories}</span>{' '}
                        <span style={{ color: '#a1a1aa' }}>kcal burned</span>
                      </span>
                    )}
                    {(onEdit || onDelete) && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 10,
                          marginLeft: 'auto',
                        }}
                      >
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => setEditingActivity(item)}
                            aria-label="Edit activity"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#a1a1aa',
                              padding: 0,
                              fontSize: 13,
                            }}
                          >
                            <i className="fa-regular fa-pen-to-square" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => removeActivity(item.id)}
                            disabled={deleting === item.id}
                            aria-label="Remove activity"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#a1a1aa',
                              padding: 0,
                              fontSize: 13,
                            }}
                          >
                            <i className="fa-regular fa-trash-can" />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
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
          onAdd={async (activity) => {
            await onEdit(editingActivity.id, activity)
            setEditingActivity(null)
          }}
          onClose={() => setEditingActivity(null)}
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
    <div
      style={{
        background: 'white',
        border: '1px solid #e4e4e7',
        borderRadius: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
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
            <div style={{ fontSize: 13, color: '#71717a', fontWeight: 500, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: '#a1a1aa' }}>
              {subtitle ?? 'Chronological order (earliest → latest)'} • {count}{' '}
              {count === 1 ? 'activity' : 'activities'}
            </div>
          </div>
          <i
            className="fa-solid fa-chevron-down"
            style={{
              color: '#71717a',
              fontSize: 14,
              transition: 'transform 0.2s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
              marginLeft: 16,
            }}
          />
        </button>
        {onAdd && showActions && (
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true)
              setInternalExpanded(true)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: '#134e4b',
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
            Log Activity
          </button>
        )}
      </div>

      {expanded && (
        <div className="log-section-content" style={{ padding: '0 24px 24px', borderTop: '1px solid #f4f4f5' }}>
          {activityList}
        </div>
      )}

      {modals}
    </div>
  )
}