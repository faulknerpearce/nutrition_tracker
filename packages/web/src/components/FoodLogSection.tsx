import { useState } from 'react'
import type { FoodEntry, NewFoodEntry } from '../lib/entries'
import AddEntryModal from './AddEntryModal'

interface FoodLogSectionProps {
  entries: FoodEntry[]
  onAdd?: (entry: NewFoodEntry) => Promise<void>
  onEdit?: (id: string, entry: NewFoodEntry) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  readOnly?: boolean
  title?: string
  subtitle?: string
  defaultExpanded?: boolean
}

export default function FoodLogSection({
  entries,
  onAdd,
  onEdit,
  onDelete,
  readOnly = false,
  title = "Today's Food Log",
  subtitle,
  defaultExpanded = false,
}: FoodLogSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const removeEntry = async (id: string) => {
    if (!onDelete) return
    setDeleting(id)
    try {
      await onDelete(id)
    } catch (err) {
      console.error('Failed to delete entry:', err)
    } finally {
      setDeleting(null)
    }
  }

  const totals = entries.reduce(
    (acc, e) => ({ calories: acc.calories + e.calories, protein: acc.protein + e.protein }),
    { calories: 0, protein: 0 },
  )
  const entryCount = entries.length
  const avgProtein = entryCount ? (totals.protein / entryCount).toFixed(1) : '0'
  const highestProtein = entryCount ? [...entries].sort((a, b) => b.protein - a.protein)[0] : null
  const avgCalPerItem = entryCount ? Math.round(totals.calories / entryCount) : 0

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
          onClick={() => setExpanded((v) => !v)}
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
            <div style={{ fontSize: 13, color: '#71717a', fontWeight: 500, marginBottom: 4 }}>
              {title}
            </div>
            <div style={{ fontSize: 12, color: '#a1a1aa' }}>
              {subtitle ?? 'Chronological order (earliest → latest)'} • {entryCount}{' '}
              {entryCount === 1 ? 'entry' : 'entries'}
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
        {!readOnly && onAdd && (
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true)
              setExpanded(true)
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
            <i className="fa-solid fa-plus" style={{ fontSize: 11 }}></i>
            Add Entry
          </button>
        )}
      </div>

      {expanded && (
        <div
          className="log-section-content"
          style={{ padding: '0 24px 24px', borderTop: '1px solid #f4f4f5' }}
        >
          {entryCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a1a1aa' }}>
              <i
                className="fa-solid fa-utensils"
                style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
              ></i>
              <p style={{ fontWeight: 500, margin: '0 0 4px 0', color: '#52525b' }}>
                No entries yet
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>
                Click "Add Entry" to log your first food item.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20 }}>
              {entries.map((item) => (
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
                      background: item.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={`fa-solid ${item.icon}`}
                      style={{ color: item.iconColor, fontSize: 22 }}
                    ></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#71717a' }}>{item.description}</div>
                    </div>
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
                        <span style={{ fontWeight: 500, color: '#ea580c' }}>{item.calories}</span>{' '}
                        <span style={{ color: '#a1a1aa' }}>kcal</span>
                      </span>
                      <span>
                        <span style={{ fontWeight: 500, color: '#059669' }}>{item.protein}g</span>{' '}
                        <span style={{ color: '#a1a1aa' }}>protein</span>
                      </span>
                      <span>
                        <span style={{ fontWeight: 500, color: '#d97706' }}>{item.carbs}g</span>{' '}
                        <span style={{ color: '#a1a1aa' }}>carbs</span>
                      </span>
                      {item.fat > 0 && (
                        <span>
                          <span style={{ fontWeight: 500, color: '#db2777' }}>{item.fat}g</span>{' '}
                          <span style={{ color: '#a1a1aa' }}>fat</span>
                        </span>
                      )}
                      {item.fiber > 0 && (
                        <span>
                          <span style={{ fontWeight: 500, color: '#65a30d' }}>{item.fiber}g</span>{' '}
                          <span style={{ color: '#a1a1aa' }}>fiber</span>
                        </span>
                      )}
                      {item.caffeine > 0 && (
                        <span>
                          <span style={{ fontWeight: 500, color: '#7c3aed' }}>
                            {item.caffeine}mg
                          </span>{' '}
                          <span style={{ color: '#a1a1aa' }}>caffeine</span>
                        </span>
                      )}
                      {(onEdit || (!readOnly && onDelete)) && (
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
                              onClick={() => setEditingEntry(item)}
                              aria-label="Edit entry"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#a1a1aa',
                                padding: 0,
                                fontSize: 13,
                              }}
                              title="Edit entry"
                            >
                              <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                          )}
                          {!readOnly && onDelete && (
                            <button
                              type="button"
                              onClick={() => removeEntry(item.id)}
                              disabled={deleting === item.id}
                              aria-label="Remove entry"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#a1a1aa',
                                padding: 0,
                                fontSize: 13,
                              }}
                              title="Remove entry"
                            >
                              <i className="fa-regular fa-trash-can"></i>
                            </button>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {highestProtein && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f4f4f5' }}>
              <div className="metric-grid-stats">
                <div
                  style={{
                    background: '#fafafa',
                    border: '1px solid #e4e4e7',
                    borderRadius: 20,
                    padding: 16,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>
                    Avg Protein per Item
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
                      fontSize: 28,
                      fontWeight: 600,
                    }}
                  >
                    {avgProtein}
                    <span style={{ fontSize: 14, fontWeight: 500 }}>g</span>
                  </div>
                </div>
                <div
                  style={{
                    background: '#fafafa',
                    border: '1px solid #e4e4e7',
                    borderRadius: 20,
                    padding: 16,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>
                    Highest Protein Item
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
                      fontSize: 28,
                      fontWeight: 600,
                      color: '#059669',
                    }}
                  >
                    {highestProtein.protein}
                    <span style={{ fontSize: 14, fontWeight: 500 }}>g</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#a1a1aa' }}>{highestProtein.name}</div>
                </div>
                <div
                  style={{
                    background: '#fafafa',
                    border: '1px solid #e4e4e7',
                    borderRadius: 20,
                    padding: 16,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>
                    Calorie Density
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
                      fontSize: 28,
                      fontWeight: 600,
                    }}
                  >
                    {avgCalPerItem}
                  </div>
                  <div style={{ fontSize: 11, color: '#a1a1aa' }}>kcal per item (avg)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddForm && onAdd && (
        <AddEntryModal onAdd={onAdd} onClose={() => setShowAddForm(false)} />
      )}
      {editingEntry && onEdit && (
        <AddEntryModal
          entry={editingEntry}
          onAdd={async (entry) => {
            await onEdit(editingEntry.id, entry)
            setEditingEntry(null)
          }}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  )
}
