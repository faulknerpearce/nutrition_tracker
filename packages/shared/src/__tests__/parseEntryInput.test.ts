import { describe, expect, it } from 'vitest'
import { buildInsertPayload, parseEntryInput } from '../parseEntryInput.js'

describe('parseEntryInput', () => {
  it('parses a fully-valid input', () => {
    const r = parseEntryInput({
      name: 'Banana',
      description: 'Fruit',
      calories: 105,
      protein: 1,
      carbs: 27,
      caffeine: 0,
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value).toMatchObject({
        name: 'Banana',
        description: 'Fruit',
        calories: 105,
        protein: 1,
        carbs: 27,
        caffeine: 0,
      })
    }
  })

  it('rounds fractional numbers', () => {
    const r = parseEntryInput({
      name: 'x',
      calories: 100.4,
      protein: 10.6,
      carbs: 0.4,
      caffeine: 0.5,
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.calories).toBe(100)
      expect(r.value.protein).toBe(11)
      expect(r.value.carbs).toBe(0)
      expect(r.value.caffeine).toBe(1)
    }
  })

  it('defaults carbs and caffeine to 0 when missing', () => {
    const r = parseEntryInput({ name: 'x', calories: 100, protein: 10 })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.carbs).toBe(0)
      expect(r.value.caffeine).toBe(0)
    }
  })

  it('applies icon defaults when icon fields are missing', () => {
    const r = parseEntryInput({ name: 'x', calories: 100, protein: 10 })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.icon).toBe('fa-utensils')
      expect(r.value.iconBg).toBe('#f4f4f5')
      expect(r.value.iconColor).toBe('#71717a')
    }
  })

  it('passes through provided icon fields', () => {
    const r = parseEntryInput({
      name: 'x',
      calories: 100,
      protein: 10,
      icon: 'fa-coffee',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.icon).toBe('fa-coffee')
      expect(r.value.iconBg).toBe('#fef3c7')
      expect(r.value.iconColor).toBe('#d97706')
    }
  })

  it('rejects non-numeric calories', () => {
    const r = parseEntryInput({ name: 'x', calories: 'oops', protein: 10 })
    expect(r.ok).toBe(false)
  })

  it('rejects negative calories', () => {
    const r = parseEntryInput({ name: 'x', calories: -1, protein: 10 })
    expect(r.ok).toBe(false)
  })

  it('rejects empty name', () => {
    const r = parseEntryInput({ name: '   ', calories: 100, protein: 10 })
    expect(r.ok).toBe(false)
  })

  it('rejects non-string icon fields by falling back to defaults', () => {
    const r = parseEntryInput({
      name: 'x',
      calories: 100,
      protein: 10,
      icon: 42 as unknown as string,
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.icon).toBe('fa-utensils')
  })

  it('ignores non-numeric carbs/caffeine (falls back to 0)', () => {
    const r = parseEntryInput({
      name: 'x',
      calories: 100,
      protein: 10,
      carbs: 'oops' as unknown as number,
      caffeine: 'oops' as unknown as number,
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.carbs).toBe(0)
      expect(r.value.caffeine).toBe(0)
    }
  })
})

describe('buildInsertPayload', () => {
  it('converts camelCase to snake_case for the DB', () => {
    const r = parseEntryInput({
      name: 'x',
      calories: 100,
      protein: 10,
      icon: 'fa-coffee',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
    })
    if (!r.ok) throw new Error('parse failed')
    const payload = buildInsertPayload(r.value, 'row-123', 'user-abc')
    expect(payload).toEqual({
      id: 'row-123',
      user_id: 'user-abc',
      icon: 'fa-coffee',
      icon_bg: '#fef3c7',
      icon_color: '#d97706',
      name: 'x',
      description: '',
      calories: 100,
      protein: 10,
      carbs: 0,
      caffeine: 0,
      fat: 0,
      fiber: 0,
    })
  })

  it('omits id when not provided', () => {
    const r = parseEntryInput({ name: 'x', calories: 100, protein: 10 })
    if (!r.ok) throw new Error('parse failed')
    const payload = buildInsertPayload(r.value, undefined, 'user-abc')
    expect(payload.id).toBeUndefined()
    expect(payload.user_id).toBe('user-abc')
  })
})
