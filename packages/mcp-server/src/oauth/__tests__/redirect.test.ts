import { describe, expect, it } from 'vitest'
import { isValidRedirectUri } from '../redirect.js'

describe('redirect URI validation', () => {
  it('allows https URIs', () => {
    expect(isValidRedirectUri('https://grok.com/oauth/callback')).toBe(true)
  })

  it('allows localhost http', () => {
    expect(isValidRedirectUri('http://localhost:3000/callback')).toBe(true)
    expect(isValidRedirectUri('http://127.0.0.1/callback')).toBe(true)
  })

  it('rejects insecure non-local URIs', () => {
    expect(isValidRedirectUri('http://example.com/callback')).toBe(false)
    expect(isValidRedirectUri('not-a-url')).toBe(false)
  })
})