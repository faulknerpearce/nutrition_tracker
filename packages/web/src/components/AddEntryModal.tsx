import { useEffect, useRef, useState } from 'react'
import {
  iconOptions,
  validateEntry,
  type FoodEntry,
  type IconOption,
  type NewFoodEntry,
} from '@nutrition-tracker/shared'
import { inputBase, labelBase } from '../lib/styles'
import Modal from './Modal'

interface AddEntryModalProps {
  entry?: FoodEntry
  onAdd: (entry: NewFoodEntry) => Promise<void>
  onClose: () => void
}

interface FormState {
  name: string
  description: string
  calories: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  caffeine: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  caffeine: '',
}

function iconFromEntry(entry: FoodEntry): IconOption {
  return (
    iconOptions.find((opt) => opt.icon === entry.icon) ?? {
      icon: entry.icon,
      label: 'Custom',
      bg: entry.iconBg,
      color: entry.iconColor,
    }
  )
}

function formFromEntry(entry: FoodEntry): FormState {
  return {
    name: entry.name,
    description: entry.description,
    calories: String(entry.calories),
    protein: String(entry.protein),
    carbs: String(entry.carbs),
    fat: String(entry.fat),
    fiber: String(entry.fiber),
    caffeine: String(entry.caffeine),
  }
}

export default function AddEntryModal({ entry, onAdd, onClose }: AddEntryModalProps) {
  const isEdit = entry !== undefined
  const [form, setForm] = useState<FormState>(() => (entry ? formFromEntry(entry) : EMPTY_FORM))
  const [selectedIcon, setSelectedIcon] = useState<IconOption>(() =>
    entry ? iconFromEntry(entry) : iconOptions[0],
  )
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    nameRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previousFocusRef.current?.focus()
    }
    // onClose is intentionally captured at mount; the modal unmounts on close
    // so the listener is torn down and the next mount gets the latest value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const close = () => {
    setForm(entry ? formFromEntry(entry) : EMPTY_FORM)
    setSelectedIcon(entry ? iconFromEntry(entry) : iconOptions[0])
    setError(null)
    onClose()
  }

  const submit = async () => {
    const candidate = {
      name: form.name,
      description: form.description,
      calories: form.calories === '' ? NaN : parseInt(form.calories, 10),
      protein: form.protein === '' ? NaN : parseInt(form.protein, 10),
      carbs: form.carbs === '' ? 0 : parseInt(form.carbs, 10) || 0,
      fat: form.fat === '' ? 0 : parseInt(form.fat, 10) || 0,
      fiber: form.fiber === '' ? 0 : parseInt(form.fiber, 10) || 0,
      caffeine: form.caffeine === '' ? 0 : parseInt(form.caffeine, 10) || 0,
    }

    const validated = validateEntry(candidate)
    if (!validated.ok) {
      setError(validated.error)
      return
    }

    setAdding(true)
    setError(null)
    try {
      await onAdd({
        icon: selectedIcon.icon,
        iconBg: selectedIcon.bg,
        iconColor: selectedIcon.color,
        ...validated.value,
      })
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'add'} entry`)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Modal titleId="entry-form-title" onClose={close}>
        <h3
          id="entry-form-title"
          style={{
            fontFamily: "'Space Grotesk','Inter',sans-serif",
            fontSize: 22,
            fontWeight: 600,
            margin: '0 0 4px 0',
          }}
        >
          {isEdit ? 'Edit Entry' : 'Add Entry'}
        </h3>
        <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 24px 0' }}>
          {isEdit
            ? 'Update this food item, including its icon and nutrition values.'
            : "Log a new food item to today's entries."}
        </p>

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

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="entry-icon" style={labelBase}>
            Icon
          </label>
          <div
            id="entry-icon"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              maxHeight: 180,
              overflowY: 'auto',
              padding: 2,
            }}
          >
            {iconOptions.map((opt) => (
              <button
                key={opt.icon}
                type="button"
                aria-label={opt.label}
                aria-pressed={selectedIcon.icon === opt.icon}
                onClick={() => setSelectedIcon(opt)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border:
                    selectedIcon.icon === opt.icon ? '2px solid #134e4b' : '2px solid transparent',
                  background: opt.bg,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className={`fa-solid ${opt.icon}`}
                  style={{ color: opt.color, fontSize: 18 }}
                ></i>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="entry-name" style={labelBase}>
            Name
          </label>
          <input
            id="entry-name"
            ref={nameRef}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Grilled Chicken"
            style={inputBase}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="entry-description" style={labelBase}>
            Description
          </label>
          <input
            id="entry-description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="e.g. Lunch"
            style={inputBase}
          />
        </div>

        <div className="modal-form-grid" style={{ marginBottom: 24 }}>
          <div>
            <label htmlFor="entry-calories" style={labelBase}>
              Calories
            </label>
            <input
              id="entry-calories"
              type="number"
              min="0"
              value={form.calories}
              onChange={(e) => update('calories', e.target.value)}
              placeholder="0"
              style={inputBase}
            />
          </div>
          <div>
            <label htmlFor="entry-protein" style={labelBase}>
              Protein (g)
            </label>
            <input
              id="entry-protein"
              type="number"
              min="0"
              value={form.protein}
              onChange={(e) => update('protein', e.target.value)}
              placeholder="0"
              style={inputBase}
            />
          </div>
          <div>
            <label htmlFor="entry-carbs" style={labelBase}>
              Carbs (g)
            </label>
            <input
              id="entry-carbs"
              type="number"
              min="0"
              value={form.carbs}
              onChange={(e) => update('carbs', e.target.value)}
              placeholder="0"
              style={inputBase}
            />
          </div>
          <div>
            <label htmlFor="entry-fat" style={labelBase}>
              Fat (g)
            </label>
            <input
              id="entry-fat"
              type="number"
              min="0"
              value={form.fat}
              onChange={(e) => update('fat', e.target.value)}
              placeholder="0"
              style={inputBase}
            />
          </div>
          <div>
            <label htmlFor="entry-fiber" style={labelBase}>
              Fiber (g)
            </label>
            <input
              id="entry-fiber"
              type="number"
              min="0"
              value={form.fiber}
              onChange={(e) => update('fiber', e.target.value)}
              placeholder="0"
              style={inputBase}
            />
          </div>
          <div>
            <label htmlFor="entry-caffeine" style={labelBase}>
              Caffeine (mg)
            </label>
            <input
              id="entry-caffeine"
              type="number"
              min="0"
              value={form.caffeine}
              onChange={(e) => update('caffeine', e.target.value)}
              placeholder="0"
              style={inputBase}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={close}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              border: '1px solid #e4e4e7',
              background: 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              color: '#52525b',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={adding}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              border: 'none',
              background: adding ? '#6b7280' : '#134e4b',
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {adding ? (isEdit ? 'Saving...' : 'Adding...') : isEdit ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
    </Modal>
  )
}
