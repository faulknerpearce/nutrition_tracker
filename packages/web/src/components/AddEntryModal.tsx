import { useEffect, useRef, useState } from 'react'
import {
  iconOptions,
  validateEntry,
  type IconOption,
  type NewFoodEntry,
} from '@nutrition-tracker/shared'

interface AddEntryModalProps {
  onAdd: (entry: NewFoodEntry) => Promise<void>
  onClose: () => void
}

interface FormState {
  name: string
  description: string
  calories: string
  protein: string
  carbs: string
  caffeine: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  calories: '',
  protein: '',
  carbs: '',
  caffeine: '',
}

export default function AddEntryModal({ onAdd, onClose }: AddEntryModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [selectedIcon, setSelectedIcon] = useState<IconOption>(iconOptions[0])
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    nameRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current?.()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previousFocusRef.current?.focus()
    }
  }, [])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const close = () => {
    setForm(EMPTY_FORM)
    setSelectedIcon(iconOptions[0])
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
      setError(err instanceof Error ? err.message : 'Failed to add entry')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-entry-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={close}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: 32,
          width: '90%',
          maxWidth: 480,
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="add-entry-title"
          style={{
            fontFamily: "'Space Grotesk','Inter',sans-serif",
            fontSize: 22,
            fontWeight: 600,
            margin: '0 0 4px 0',
          }}
        >
          Add Entry
        </h3>
        <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 24px 0' }}>
          Log a new food item to today's entries.
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
          <label
            htmlFor="entry-icon"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#52525b',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Icon
          </label>
          <div id="entry-icon" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
          <label
            htmlFor="entry-name"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#52525b',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Name
          </label>
          <input
            id="entry-name"
            ref={nameRef}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Grilled Chicken"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #e4e4e7',
              borderRadius: 12,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="entry-description"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#52525b',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Description
          </label>
          <input
            id="entry-description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="e.g. Lunch"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #e4e4e7',
              borderRadius: 12,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div>
            <label
              htmlFor="entry-calories"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#52525b',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Calories
            </label>
            <input
              id="entry-calories"
              type="number"
              min="0"
              value={form.calories}
              onChange={(e) => update('calories', e.target.value)}
              placeholder="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e4e4e7',
                borderRadius: 12,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="entry-protein"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#52525b',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Protein (g)
            </label>
            <input
              id="entry-protein"
              type="number"
              min="0"
              value={form.protein}
              onChange={(e) => update('protein', e.target.value)}
              placeholder="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e4e4e7',
                borderRadius: 12,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="entry-carbs"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#52525b',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Carbs (g)
            </label>
            <input
              id="entry-carbs"
              type="number"
              min="0"
              value={form.carbs}
              onChange={(e) => update('carbs', e.target.value)}
              placeholder="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e4e4e7',
                borderRadius: 12,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="entry-caffeine"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#52525b',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Caffeine (mg)
            </label>
            <input
              id="entry-caffeine"
              type="number"
              min="0"
              value={form.caffeine}
              onChange={(e) => update('caffeine', e.target.value)}
              placeholder="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e4e4e7',
                borderRadius: 12,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
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
            {adding ? 'Adding...' : 'Add Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}
