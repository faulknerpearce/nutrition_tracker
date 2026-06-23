import { describe, expect, it } from 'vitest'
import { sha256Base64Url, signPayload, verifyPayload, verifyPkce } from '../crypto.js'
import type { AuthCodePayload } from '../types.js'

const SECRET = 'test-signing-secret'

describe('oauth crypto', () => {
  it('signs and verifies payloads', async () => {
    const payload: AuthCodePayload = {
      typ: 'auth_code',
      client_id: 'client-1',
      redirect_uri: 'https://example.com/callback',
      code_challenge: 'challenge',
      code_challenge_method: 'S256',
      access_token: 'access',
      refresh_token: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 300,
    }

    const token = await signPayload(SECRET, payload)
    const verified = await verifyPayload<AuthCodePayload>(SECRET, token)
    expect(verified).toEqual(payload)
  })

  it('rejects expired payloads', async () => {
    const payload: AuthCodePayload = {
      typ: 'auth_code',
      client_id: 'client-1',
      redirect_uri: 'https://example.com/callback',
      code_challenge: 'challenge',
      code_challenge_method: 'S256',
      access_token: 'access',
      refresh_token: 'refresh',
      exp: Math.floor(Date.now() / 1000) - 10,
    }

    const token = await signPayload(SECRET, payload)
    const verified = await verifyPayload<AuthCodePayload>(SECRET, token)
    expect(verified).toBeNull()
  })

  it('verifies PKCE S256', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    const challenge = await sha256Base64Url(verifier)
    expect(await verifyPkce(verifier, challenge, 'S256')).toBe(true)
    expect(await verifyPkce(verifier, 'wrong', 'S256')).toBe(false)
    expect(await verifyPkce(verifier, challenge, 'plain')).toBe(false)
  })
})