import { useEffect, useState } from 'react'
import {
  DEFAULT_NUTRITION_GOALS,
  type GoalRange,
  type NutritionGoals,
} from '@nutrition-tracker/shared'
import { useGoals } from '../context/useGoals'
import { inputBase, labelBase } from '../lib/styles'
import Modal from './Modal'

interface GoalsModalProps {
  onClose: () => void
}

type GoalKey = keyof NutritionGoals

const GOAL_FIELDS: {
  key: GoalKey
  label: string
  unit: string
  showRange: boolean
}[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', showRange: true },
  { key: 'protein', label: 'Protein', unit: 'g', showRange: true },
  { key: 'carbs', label: 'Carbs', unit: 'g', showRange: false },
  { key: 'fat', label: 'Fat', unit: 'g', showRange: false },
  { key: 'fiber', label: 'Fiber', unit: 'g', showRange: false },
  { key: 'caffeine', label: 'Caffeine', unit: 'mg', showRange: false },
]

function parseField(value: string): number {
  if (value.trim() === '') return NaN
  return parseInt(value, 10)
}

export default function GoalsModal({ onClose }: GoalsModalProps) {
  const { goals, updateGoals } = useGoals()
  const [form, setForm] = useState<NutritionGoals>(() => structuredClone(goals))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const updateGoal = (key: GoalKey, field: keyof GoalRange, value: string) => {
    const parsed = parseField(value)
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: Number.isFinite(parsed) ? parsed : prev[key][field],
      },
    }))
  }

  const resetDefaults = () => {
    setForm(structuredClone(DEFAULT_NUTRITION_GOALS))
    setError(null)
  }

  const normalizeGoals = (source: NutritionGoals): NutritionGoals => {
    const next = structuredClone(source)
    for (const { key, showRange } of GOAL_FIELDS) {
      if (!showRange) {
        next[key] = { value: next[key].value, low: next[key].value, high: next[key].value }
      }
      if (key === 'caffeine') {
        next.caffeine = {
          value: next.caffeine.value,
          low: 0,
          high: Math.max(next.caffeine.value, next.caffeine.high),
        }
      }
    }
    return next
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    const result = await updateGoals(normalizeGoals(form))
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onClose()
  }

  return (
    <Modal titleId="goals-form-title" onClose={onClose}>
      <h3
        id="goals-form-title"
        style={{
          fontFamily: "'Space Grotesk','Inter',sans-serif",
          fontSize: 22,
          fontWeight: 600,
          margin: '0 0 4px 0',
        }}
      >
        Daily Goals
      </h3>
      <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 24px 0' }}>
        Set your daily nutrition targets. Calories and protein ranges also drive the net energy
        goal band on the dashboard.
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
        {GOAL_FIELDS.map(({ key, label, unit, showRange }) => {
          const goal = form[key]
          return (
            <div
              key={key}
              style={{
                padding: 16,
                borderRadius: 16,
                border: '1px solid #f4f4f5',
                background: '#fafafa',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', marginBottom: 12 }}>
                {label}
              </div>
              <div className="modal-form-grid">
                <div>
                  <label htmlFor={`goal-${key}-value`} style={labelBase}>
                    Target ({unit})
                  </label>
                  <input
                    id={`goal-${key}-value`}
                    type="number"
                    min="1"
                    value={goal.value}
                    onChange={(e) => updateGoal(key, 'value', e.target.value)}
                    style={inputBase}
                  />
                </div>
                {showRange ? (
                  <>
                    <div>
                      <label htmlFor={`goal-${key}-low`} style={labelBase}>
                        Low ({unit})
                      </label>
                      <input
                        id={`goal-${key}-low`}
                        type="number"
                        min={key === 'caffeine' ? 0 : 1}
                        value={goal.low}
                        onChange={(e) => updateGoal(key, 'low', e.target.value)}
                        style={inputBase}
                      />
                    </div>
                    <div>
                      <label htmlFor={`goal-${key}-high`} style={labelBase}>
                        High ({unit})
                      </label>
                      <input
                        id={`goal-${key}-high`}
                        type="number"
                        min="1"
                        value={goal.high}
                        onChange={(e) => updateGoal(key, 'high', e.target.value)}
                        style={inputBase}
                      />
                    </div>
                  </>
                ) : (
                  <div aria-hidden="true" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={resetDefaults}
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
          Reset defaults
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
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
            disabled={saving}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              border: 'none',
              background: saving ? '#6b7280' : '#134e4b',
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </div>
    </Modal>
  )
}