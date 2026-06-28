import { useEffect, useRef, useState } from 'react'
import {
  currentTimeInputValue,
  formatTimeInputValue,
  iconOptions,
  loggedAtFromDayAndTime,
  scaleMacrosByPortion,
  scaleRecipeToServings,
  validateEntry,
  validatePortionInput,
  type FoodEntry,
  type FoodEntryWrite,
  type IconOption,
  type PortionUnit,
  type RecipeSummary,
} from '@nutrition-tracker/shared'
import { focusIfDesktop } from '../lib/device'
import { fetchRecipeSummaries } from '../lib/recipes'
import { inputBase, labelBase } from '../lib/styles'
import Modal from './Modal'

type AddMode = 'manual' | 'recipe'

interface AddEntryModalProps {
  entry?: FoodEntry
  prefill?: FoodEntryWrite
  logDate: string
  timeZone: string
  onAdd: (
    entry: FoodEntryWrite,
    options?: {
      saveAsRecipe?: boolean
      perServing?: FoodEntryWrite
      servingWeightGrams?: number
    },
  ) => Promise<void>
  onLogRecipe?: (
    recipeId: string,
    options: {
      portionUnit: PortionUnit
      portionQuantity: number
      servingWeightGrams?: number
      loggedAt?: string
    },
  ) => Promise<void>
  onClose: () => void
}

interface FormState {
  name: string
  description: string
  logTime: string
  calories: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  caffeine: string
}

function initialLogTime(entry: FoodEntry | undefined, timeZone: string): string {
  if (entry?.loggedAt) return formatTimeInputValue(entry.loggedAt, timeZone)
  return currentTimeInputValue(timeZone)
}

function emptyForm(timeZone: string): FormState {
  return {
    name: '',
    description: '',
    logTime: currentTimeInputValue(timeZone),
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    caffeine: '',
  }
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

function formFromEntry(entry: FoodEntry, timeZone: string): FormState {
  return {
    name: entry.name,
    description: entry.description,
    logTime: initialLogTime(entry, timeZone),
    calories: String(entry.calories),
    protein: String(entry.protein),
    carbs: String(entry.carbs),
    fat: String(entry.fat),
    fiber: String(entry.fiber),
    caffeine: String(entry.caffeine),
  }
}

function formFromNewEntry(entry: FoodEntryWrite, timeZone: string): FormState {
  return {
    ...formFromEntry({ ...entry, id: 'prefill', loggedAt: entry.loggedAt ?? '' }, timeZone),
    logTime: entry.loggedAt
      ? formatTimeInputValue(entry.loggedAt, timeZone)
      : currentTimeInputValue(timeZone),
  }
}

function iconFromNewEntry(entry: FoodEntryWrite): IconOption {
  return (
    iconOptions.find((opt) => opt.icon === entry.icon) ?? {
      icon: entry.icon,
      label: 'Custom',
      bg: entry.iconBg,
      color: entry.iconColor,
    }
  )
}

interface PortionAmountFieldsProps {
  portionUnit: PortionUnit
  onPortionUnitChange: (unit: PortionUnit) => void
  portionQuantity: string
  onPortionQuantityChange: (value: string) => void
  referenceWeightGrams: string
  quantityInputId: string
}

function PortionAmountFields({
  portionUnit,
  onPortionUnitChange,
  portionQuantity,
  onPortionQuantityChange,
  referenceWeightGrams,
  quantityInputId,
}: PortionAmountFieldsProps) {
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['servings', 'grams'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onPortionUnitChange(value)}
            style={{
              padding: '8px 14px',
              borderRadius: 9999,
              border: portionUnit === value ? '1px solid #134e4b' : '1px solid #e4e4e7',
              background: portionUnit === value ? '#134e4b' : 'white',
              color: portionUnit === value ? 'white' : '#52525b',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {value === 'servings' ? 'Servings' : 'Weight (g)'}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor={quantityInputId} style={labelBase}>
          {portionUnit === 'grams'
            ? 'How many grams did you have?'
            : 'How many servings did you have?'}
        </label>
        <input
          id={quantityInputId}
          type="number"
          min={portionUnit === 'grams' ? '1' : '0.25'}
          step={portionUnit === 'grams' ? '1' : '0.25'}
          value={portionQuantity}
          onChange={(e) => onPortionQuantityChange(e.target.value)}
          style={inputBase}
        />
        <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
          {portionUnit === 'grams'
            ? `Each serving equals ${referenceWeightGrams || '…'}g of the reference amount above.`
            : `One serving equals the ${referenceWeightGrams || '…'}g reference amount above.`}
        </p>
      </div>
    </>
  )
}

export default function AddEntryModal({
  entry,
  prefill,
  logDate,
  timeZone,
  onAdd,
  onLogRecipe,
  onClose,
}: AddEntryModalProps) {
  const isEdit = entry !== undefined
  const isScanned = prefill !== undefined && !isEdit
  const [mode, setMode] = useState<AddMode>('manual')
  const [form, setForm] = useState<FormState>(() =>
    entry
      ? formFromEntry(entry, timeZone)
      : prefill
        ? formFromNewEntry(prefill, timeZone)
        : emptyForm(timeZone),
  )
  const [recipeLogTime, setRecipeLogTime] = useState(() => currentTimeInputValue(timeZone))
  const [selectedIcon, setSelectedIcon] = useState<IconOption>(() =>
    entry ? iconFromEntry(entry) : prefill ? iconFromNewEntry(prefill) : iconOptions[0],
  )
  const [saveAsRecipe, setSaveAsRecipe] = useState(false)
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [recipePortionUnit, setRecipePortionUnit] = useState<PortionUnit>('servings')
  const [recipePortionQuantity, setRecipePortionQuantity] = useState('1')
  const [recipeServingWeightGrams, setRecipeServingWeightGrams] = useState('100')
  const [referenceWeightGrams, setReferenceWeightGrams] = useState(() =>
    prefill?.referenceWeightGrams ? String(prefill.referenceWeightGrams) : '100',
  )
  const [portionUnit, setPortionUnit] = useState<PortionUnit>(() =>
    prefill?.nutritionBasisNote?.toLowerCase().includes('per 100g') ? 'grams' : 'servings',
  )
  const [portionQuantity, setPortionQuantity] = useState('1')
  const [nutritionBasisNote, setNutritionBasisNote] = useState(prefill?.nutritionBasisNote ?? '')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId)
  const recipeServingWeightNum = Number.parseFloat(recipeServingWeightGrams)
  const resolvedRecipeServingWeightGrams =
    Number.isFinite(recipeServingWeightNum) && recipeServingWeightNum > 0
      ? recipeServingWeightNum
      : null
  const recipePortionQuantityNum = Number.parseFloat(recipePortionQuantity)
  const recipeEffectiveServings =
    selectedRecipe && recipePortionQuantity !== '' && Number.isFinite(recipePortionQuantityNum)
      ? recipePortionUnit === 'grams'
        ? resolvedRecipeServingWeightGrams
          ? recipePortionQuantityNum / resolvedRecipeServingWeightGrams
          : NaN
        : recipePortionQuantityNum
      : NaN
  const previewTotals =
    selectedRecipe &&
    recipePortionQuantity !== '' &&
    Number.isFinite(recipeEffectiveServings) &&
    recipeEffectiveServings > 0
      ? scaleRecipeToServings(
          selectedRecipe.batchTotals,
          selectedRecipe.defaultServings,
          recipeEffectiveServings,
        )
      : null
  const referenceWeightNum = Number.parseFloat(referenceWeightGrams)
  const portionQuantityNum = Number.parseFloat(portionQuantity)
  const baseMacroPreview =
    !isEdit &&
    portionQuantity !== '' &&
    Number.isFinite(portionQuantityNum) &&
    portionQuantityNum > 0 &&
    Number.isFinite(referenceWeightNum) &&
    referenceWeightNum > 0
      ? {
          calories: form.calories === '' ? NaN : Number.parseInt(form.calories, 10),
          protein: form.protein === '' ? NaN : Number.parseInt(form.protein, 10),
          carbs: form.carbs === '' ? 0 : Number.parseInt(form.carbs, 10) || 0,
          fat: form.fat === '' ? 0 : Number.parseInt(form.fat, 10) || 0,
          fiber: form.fiber === '' ? 0 : Number.parseInt(form.fiber, 10) || 0,
          caffeine: form.caffeine === '' ? 0 : Number.parseInt(form.caffeine, 10) || 0,
        }
      : null
  const entryPreviewTotals =
    baseMacroPreview &&
    Number.isFinite(baseMacroPreview.calories) &&
    Number.isFinite(baseMacroPreview.protein)
      ? scaleMacrosByPortion(baseMacroPreview, {
          portionUnit,
          portionQuantity: portionQuantityNum,
          referenceWeightGrams: referenceWeightNum,
        })
      : null

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    focusIfDesktop(nameRef.current)

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

  useEffect(() => {
    if (isEdit || mode !== 'recipe') return
    fetchRecipeSummaries()
      .then((data) => {
        setRecipes(data)
        setSelectedRecipeId((current) => current || data[0]?.id || '')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load recipes')
      })
  }, [isEdit, mode])

  useEffect(() => {
    if (!selectedRecipe) return
    setRecipeServingWeightGrams(
      selectedRecipe.servingWeightGrams ? String(selectedRecipe.servingWeightGrams) : '100',
    )
  }, [selectedRecipeId, selectedRecipe?.servingWeightGrams])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const resolveLoggedAt = () => loggedAtFromDayAndTime(logDate, form.logTime, timeZone)

  const close = () => {
    setForm(entry ? formFromEntry(entry, timeZone) : emptyForm(timeZone))
    setSelectedIcon(entry ? iconFromEntry(entry) : iconOptions[0])
    setReferenceWeightGrams('100')
    setPortionUnit('servings')
    setPortionQuantity('1')
    setNutritionBasisNote('')
    setRecipePortionUnit('servings')
    setRecipePortionQuantity('1')
    setRecipeServingWeightGrams('100')
    setRecipeLogTime(currentTimeInputValue(timeZone))
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

    let portionMeta:
      | {
          portionUnit: PortionUnit
          portionQuantity: number
          referenceWeightGrams: number
        }
      | undefined

    if (!isEdit) {
      const portionValidated = validatePortionInput({
        portionUnit,
        portionQuantity,
        referenceWeightGrams,
      })
      if (!portionValidated.ok) {
        setError(portionValidated.error)
        return
      }
      portionMeta = portionValidated.value
    }

    const loggedAt = resolveLoggedAt()
    if (!loggedAt.ok) {
      setError(loggedAt.error)
      return
    }

    const baseEntry: FoodEntryWrite = {
      icon: selectedIcon.icon,
      iconBg: selectedIcon.bg,
      iconColor: selectedIcon.color,
      ...validated.value,
      loggedAt: loggedAt.value,
    }
    const loggedEntry =
      isEdit || !portionMeta
        ? baseEntry
        : {
            ...baseEntry,
            ...scaleMacrosByPortion(validated.value, portionMeta),
            portionUnit: portionMeta.portionUnit,
            portionQuantity: portionMeta.portionQuantity,
            referenceWeightGrams: portionMeta.referenceWeightGrams,
          }
    const perReferenceEntry = baseEntry

    setAdding(true)
    setError(null)
    try {
      await onAdd(loggedEntry, {
        saveAsRecipe,
        perServing: saveAsRecipe ? perReferenceEntry : undefined,
        servingWeightGrams: saveAsRecipe ? portionMeta?.referenceWeightGrams : undefined,
      })
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'add'} entry`)
    } finally {
      setAdding(false)
    }
  }

  const submitRecipe = async () => {
    if (!onLogRecipe) return
    if (!selectedRecipeId) {
      setError('Select a recipe')
      return
    }
    if (recipePortionUnit === 'grams' && !resolvedRecipeServingWeightGrams) {
      setError('Enter a serving weight greater than 0 to log by grams.')
      return
    }

    const portionQuantityValue = Number.parseFloat(recipePortionQuantity)
    if (!Number.isFinite(portionQuantityValue) || portionQuantityValue <= 0) {
      setError(recipePortionUnit === 'grams' ? 'Weight must be greater than 0' : 'Servings must be greater than 0')
      return
    }

    const loggedAt = loggedAtFromDayAndTime(logDate, recipeLogTime, timeZone)
    if (!loggedAt.ok) {
      setError(loggedAt.error)
      return
    }

    setAdding(true)
    setError(null)
    try {
      await onLogRecipe(selectedRecipeId, {
        portionUnit: recipePortionUnit,
        portionQuantity: portionQuantityValue,
        servingWeightGrams:
          recipePortionUnit === 'grams' ? resolvedRecipeServingWeightGrams ?? undefined : undefined,
        loggedAt: loggedAt.value,
      })
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log recipe')
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
            ? 'Update this food item, including when you ate it, its icon, and nutrition values.'
            : isScanned
              ? 'Review the scanned product, set how many servings you had, and adjust nutrition values if needed.'
              : "Log a new food item to today's entries."}
        </p>

        {!isEdit && onLogRecipe && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['manual', 'recipe'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 9999,
                  border: mode === value ? '1px solid #134e4b' : '1px solid #e4e4e7',
                  background: mode === value ? '#134e4b' : 'white',
                  color: mode === value ? 'white' : '#52525b',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {value === 'manual' ? 'Manual' : 'From Recipe'}
              </button>
            ))}
          </div>
        )}

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

        {!isEdit && mode === 'recipe' ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="entry-recipe" style={labelBase}>
                Saved recipe
              </label>
              <select
                id="entry-recipe"
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                style={{ ...inputBase, paddingRight: 12 }}
              >
                {recipes.length === 0 ? (
                  <option value="">No recipes yet</option>
                ) : (
                  recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name} ({recipe.perServingTotals.calories} kcal/serving)
                    </option>
                  ))
                )}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="entry-recipe-log-time" style={labelBase}>
                Log time
              </label>
              <input
                id="entry-recipe-log-time"
                type="time"
                value={recipeLogTime}
                onChange={(e) => setRecipeLogTime(e.target.value)}
                style={inputBase}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="entry-recipe-reference-weight" style={labelBase}>
                Reference weight (g)
              </label>
              <input
                id="entry-recipe-reference-weight"
                type="number"
                min="1"
                step="1"
                value={recipeServingWeightGrams}
                onChange={(e) => setRecipeServingWeightGrams(e.target.value)}
                style={inputBase}
              />
              <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
                One serving of this recipe equals this weight ({selectedRecipe?.perServingTotals.calories ?? 0}{' '}
                kcal per serving).
              </p>
            </div>
            <PortionAmountFields
              portionUnit={recipePortionUnit}
              onPortionUnitChange={setRecipePortionUnit}
              portionQuantity={recipePortionQuantity}
              onPortionQuantityChange={setRecipePortionQuantity}
              referenceWeightGrams={recipeServingWeightGrams}
              quantityInputId="entry-recipe-portion"
            />
            {previewTotals && (
              <div
                style={{
                  marginBottom: 24,
                  padding: 16,
                  borderRadius: 16,
                  background: '#ecfdf5',
                  color: '#065f46',
                  fontSize: 13,
                }}
              >
                This log will add {previewTotals.calories} kcal, {previewTotals.protein}g protein,{' '}
                {previewTotals.carbs}g carbs.
              </div>
            )}
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
                onClick={submitRecipe}
                disabled={adding || recipes.length === 0}
                style={{
                  padding: '10px 20px',
                  borderRadius: 9999,
                  border: 'none',
                  background: adding || recipes.length === 0 ? '#6b7280' : '#134e4b',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {adding ? 'Logging...' : 'Log Recipe'}
              </button>
            </div>
          </>
        ) : (
          <>
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

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="entry-log-time" style={labelBase}>
            Log time
          </label>
          <input
            id="entry-log-time"
            type="time"
            value={form.logTime}
            onChange={(e) => update('logTime', e.target.value)}
            style={inputBase}
          />
          <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
            When you ate this meal. Used for the Eating Times chart.
          </p>
        </div>

        {!isEdit && (
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="entry-reference-weight" style={labelBase}>
              Reference weight (g)
            </label>
            <input
              id="entry-reference-weight"
              type="number"
              min="1"
              step="1"
              value={referenceWeightGrams}
              onChange={(e) => setReferenceWeightGrams(e.target.value)}
              style={inputBase}
            />
            <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
              Nutrition values below are for this amount of food.
              {nutritionBasisNote ? ` ${nutritionBasisNote}.` : ''}
            </p>
          </div>
        )}

        <div className="modal-form-grid" style={{ marginBottom: 24 }}>
          <div>
            <label htmlFor="entry-calories" style={labelBase}>
              {isEdit ? 'Calories' : `Calories (per ${referenceWeightGrams || '…'}g)`}
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

        {!isEdit && (
          <PortionAmountFields
            portionUnit={portionUnit}
            onPortionUnitChange={setPortionUnit}
            portionQuantity={portionQuantity}
            onPortionQuantityChange={setPortionQuantity}
            referenceWeightGrams={referenceWeightGrams}
            quantityInputId="entry-portion-quantity"
          />
        )}

        {!isEdit && entryPreviewTotals && portionQuantityNum !== (portionUnit === 'servings' ? 1 : referenceWeightNum) && (
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 16,
              background: '#ecfdf5',
              color: '#065f46',
              fontSize: 13,
            }}
          >
            This log will add {entryPreviewTotals.calories} kcal, {entryPreviewTotals.protein}g
            protein, {entryPreviewTotals.carbs}g carbs.
          </div>
        )}

        {!isEdit && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
              fontSize: 13,
              color: '#52525b',
            }}
          >
            <input
              type="checkbox"
              checked={saveAsRecipe}
              onChange={(e) => setSaveAsRecipe(e.target.checked)}
            />
            Save as recipe for quick logging later
          </label>
        )}

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
          </>
        )}
    </Modal>
  )
}
