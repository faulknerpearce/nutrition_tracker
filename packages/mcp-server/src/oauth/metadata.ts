import type { OAuthEnv } from './types.js'

function baseUrl(env: OAuthEnv): string {
  return env.MCP_PUBLIC_URL.replace(/\/$/, '')
}

export function authorizationServerMetadata(env: OAuthEnv): Record<string, unknown> {
  const origin = baseUrl(env)
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/authorize`,
    token_endpoint: `${origin}/token`,
    registration_endpoint: `${origin}/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: ['openid', 'profile'],
  }
}

export function protectedResourceMetadata(env: OAuthEnv): Record<string, unknown> {
  const origin = baseUrl(env)
  return {
    resource: `${origin}/mcp`,
    authorization_servers: [origin],
    scopes_supported: ['openid', 'profile'],
    bearer_methods_supported: ['header'],
  }
}

export function handleAuthorizationServerMetadata(env: OAuthEnv): Response {
  return Response.json(authorizationServerMetadata(env), {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}

export function handleProtectedResourceMetadata(env: OAuthEnv): Response {
  return Response.json(protectedResourceMetadata(env), {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}

export function wwwAuthenticateHeader(env: OAuthEnv): string {
  const origin = baseUrl(env)
  const resourceMetadata = `${origin}/.well-known/oauth-protected-resource`
  return `Bearer realm="nutrition-tracker", resource_metadata="${resourceMetadata}"`
}