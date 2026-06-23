import { describe, expect, it } from 'vitest'
import { validateEntry } from '../validation.js'

describe('validateEntry', () => {
  const valid = {
    name: 'Chicken Wrap',
    description: 'Lunch',
    calories: 500,
    protein: 40,
    carbs: 50,
    caffeine: 0,
    fat: 0,
    fiber: 0,
  }

  it('accepts a fully-valid entry', () => {
    expect(validateEntry(valid)).toEqual({ ok: true, value: valid })
  })

  it('rejects an empty name', () => {
    const r = validateEntry({ ...valid, name: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/name/i)
  })

  it('rejects a whitespace-only name', () => {
    const r = validateEntry({ ...valid, name: '   ' })
    expect(r.ok).toBe(false)
  })

  it('trims the name on success', () => {
    const r = validateEntry({ ...valid, name: '  Wrap  ' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.name).toBe('Wrap')
  })

  it('rejects missing or non-numeric calories', () => {
    expect(validateEntry({ ...valid, calories: 'oops' as unknown as number }).ok).toBe(false)
    expect(validateEntry({ ...valid, calories: undefined as unknown as number }).ok).toBe(false)
  })

  it('rejects negative calories', () => {
    expect(validateEntry({ ...valid, calories: -1 }).ok).toBe(false)
  })

  it('accepts zero calories', () => {
    const r = validateEntry({ ...valid, calories: 0 })
    expect(r.ok).toBe(true)
  })

  it('rejects negative protein', () => {
    expect(validateEntry({ ...valid, protein: -5 }).ok).toBe(false)
  })

  it('rejects negative carbs when provided', () => {
    expect(validateEntry({ ...valid, carbs: -1 }).ok).toBe(false)
  })

  it('rejects negative caffeine when provided', () => {
    expect(validateEntry({ ...valid, caffeine: -1 }).ok).toBe(false)
  })

  it('defaults carbs and caffeine to 0 when omitted', () => {
    const r = validateEntry({
      name: 'x',
      calories: 100,
      protein: 10,
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.carbs).toBe(0)
      expect(r.value.caffeine).toBe(0)
      expect(r.value.description).toBe('')
    }
  })

  it('rejects NaN and Infinity', () => {
    expect(validateEntry({ ...valid, calories: Number.NaN }).ok).toBe(false)
    expect(validateEntry({ ...valid, calories: Number.POSITIVE_INFINITY }).ok).toBe(false)
  })
})
