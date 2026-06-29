import { describe, expect, it, vi } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}))

import { isShareNew } from '../lib/sharedNotifications'

describe('isShareNew', () => {
  it('treats all shares as new when the user has never opened Shared With Me', () => {
    expect(isShareNew('2026-06-28T10:00:00.000Z', null)).toBe(true)
  })

  it('marks shares created after the last visit as new', () => {
    expect(isShareNew('2026-06-28T12:00:00.000Z', '2026-06-28T11:00:00.000Z')).toBe(true)
  })

  it('marks shares created before the last visit as seen', () => {
    expect(isShareNew('2026-06-28T10:00:00.000Z', '2026-06-28T11:00:00.000Z')).toBe(false)
  })

  it('compares timestamps with different ISO formats', () => {
    expect(
      isShareNew('2026-06-28T12:00:00.000000+00:00', '2026-06-28T11:00:00.000Z'),
    ).toBe(true)
  })
})