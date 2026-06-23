/** MCP spec: redirect URIs must be HTTPS or localhost. */
export function isValidRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri)
    if (url.protocol === 'https:') return true
    if (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    ) {
      return true
    }
    return false
  } catch {
    return false
  }
}

export function redirectUriMatches(stored: string, provided: string): boolean {
  return stored === provided
}