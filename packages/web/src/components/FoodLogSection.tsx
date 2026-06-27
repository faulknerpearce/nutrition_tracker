import { useState } from 'react'
import type { MappedBarcodeProduct } from '../lib/openFoodFacts'
import type { FoodEntry, FoodEntryWrite } from '../lib/entries'
import AddEntryModal from './AddEntryModal'
import BarcodeScannerModal from './BarcodeScannerModal'
import FoodLogEntryStats from './FoodLogEntryStats'
import ShareModal from './ShareModal'

interface FoodLogSectionProps {
  entries: FoodEntry[]
  logDate: string
  timeZone: string
  onAdd?: (
    entry: FoodEntryWrite,
    options?: { saveAsRecipe?: boolean; perServing?: FoodEntryWrite },
  ) => Promise<void>
  onLogRecipe?: (
    recipeId: string,
    servings: number,
    options?: { loggedAt?: string },
  ) => Promise<void>
  onEdit?: (id: string, entry: FoodEntryWrite) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  readOnly?: boolean
  title?: string
  subtitle?: string
  defaultExpanded?: boolean
  collapsible?: boolean
  showActions?: boolean
  showEntryStats?: boolean
  addFormOpen?: boolean
  onAddFormOpenChange?: (open: boolean) => void
  scannerOpen?: boolean
  onScannerOpenChange?: (open: boolean) => void
  prefillEntry?: FoodEntryWrite | null
  onPrefillEntryChange?: (entry: FoodEntryWrite | null) => void
}

export default function FoodLogSection({
  entries,
  logDate,
  timeZone,
  onAdd,
  onLogRecipe,
  onEdit,
  onDelete,
  readOnly = false,
  title = "Today's Food Log",
  subtitle,
  defaultExpanded = false,
  collapsible = true,
  showActions = true,
  showEntryStats = true,
  addFormOpen,
  onAddFormOpenChange,
  scannerOpen,
  onScannerOpenChange,
  prefillEntry,
  onPrefillEntryChange,
}: FoodLogSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const [internalShowAddForm, setInternalShowAddForm] = useState(false)
  const [internalShowScanner, setInternalShowScanner] = useState(false)
  const [internalPrefillEntry, setInternalPrefillEntry] = useState<FoodEntryWrite | null>(null)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [sharingEntry, setSharingEntry] = useState<FoodEntry | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const expanded = collapsible ? internalExpanded : true
  const showAddForm = addFormOpen ?? internalShowAddForm
  const setShowAddForm = onAddFormOpenChange ?? setInternalShowAddForm
  const showScanner = scannerOpen ?? internalShowScanner
  const setShowScanner = onScannerOpenChange ?? setInternalShowScanner
  const currentPrefillEntry = prefillEntry !== undefined ? prefillEntry : internalPrefillEntry
  const setPrefillEntry = onPrefillEntryChange ?? setInternalPrefillEntry

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

  const entryCount = entries.length

  const entryList = (
    <>
      {entryCount === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a1a1aa' }}>
          <i className="fa-solid fa-utensils" style={{ fontSize: 32, marginBottom: 12, display: 'block' }} />
          <p style={{ fontWeight: 500, margin: '0 0 4px 0', color: '#52525b' }}>No entries yet</p>
          <p style={{ fontSize: 13, margin: 0 }}>
            {showActions ? 'Click "Add Entry" to log your first food item.' : 'Use the buttons above to log your first food item.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: collapsible ? 20 : 0 }}>
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
                <i className={`fa-solid ${item.icon}`} style={{ color: item.iconColor, fontSize: 22 }} />
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
                      <span style={{ fontWeight: 500, color: '#7c3aed' }}>{item.caffeine}mg</span>{' '}
                      <span style={{ color: '#a1a1aa' }}>caffeine</span>
                    </span>
                  )}
                  {(onEdit || !readOnly) && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        marginLeft: 'auto',
                      }}
                    >
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setSharingEntry(item)}
                          aria-label="Share entry"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#a1a1aa',
                            padding: 0,
                            fontSize: 13,
                          }}
                          title="Share entry"
                        >
                          <i className="fa-regular fa-share-from-square" />
                        </button>
                      )}
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
                          <i className="fa-regular fa-pen-to-square" />
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
                          <i className="fa-regular fa-trash-can" />
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

      {showEntryStats && entryCount > 0 && (
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f4f4f5' }}>
          <FoodLogEntryStats entries={entries} />
        </div>
      )}
    </>
  )

  const modals = (
    <>
      {showScanner && onAdd && (
        <BarcodeScannerModal
          onProductFound={(product: MappedBarcodeProduct) => {
            setPrefillEntry(product.entry)
            setShowScanner(false)
            setShowAddForm(true)
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
      {showAddForm && onAdd && (
        <AddEntryModal
          prefill={currentPrefillEntry ?? undefined}
          logDate={logDate}
          timeZone={timeZone}
          onAdd={onAdd}
          onLogRecipe={onLogRecipe}
          onClose={() => {
            setShowAddForm(false)
            setPrefillEntry(null)
          }}
        />
      )}
      {editingEntry && onEdit && (
        <AddEntryModal
          entry={editingEntry}
          logDate={logDate}
          timeZone={timeZone}
          onAdd={async (entry) => {
            await onEdit(editingEntry.id, entry)
            setEditingEntry(null)
          }}
          onClose={() => setEditingEntry(null)}
        />
      )}
      {sharingEntry && (
        <ShareModal
          resourceType="entry"
          resourceId={sharingEntry.id}
          resourceName={sharingEntry.name}
          onClose={() => setSharingEntry(null)}
        />
      )}
    </>
  )

  if (!collapsible) {
    return (
      <>
        {entryList}
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
        {!readOnly && onAdd && showActions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                setPrefillEntry(null)
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
              }}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
              Add Entry
            </button>
            <button
              type="button"
              onClick={() => {
                setShowScanner(true)
                setInternalExpanded(true)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'white',
                color: '#134e4b',
                border: '1px solid #134e4b',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <i className="fa-solid fa-barcode" style={{ fontSize: 11 }} />
              Scan Barcode
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="log-section-content" style={{ padding: '0 24px 24px', borderTop: '1px solid #f4f4f5' }}>
          {entryList}
        </div>
      )}

      {modals}
    </div>
  )
}