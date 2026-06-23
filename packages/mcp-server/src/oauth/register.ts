import { randomId } from './crypto.js'
import { isValidRedirectUri } from './redirect.js'
import type { OAuthEnv, RegisteredClient } from './types.js'

export async function handleRegister(request: Request, _env: OAuthEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405 })
  }

  let body: Partial<RegisteredClient>
  try {
    body = (await request.json()) as Partial<RegisteredClient>
  } catch {
    return Response.json({ error: 'invalid_request', error_description: 'Invalid JSON' }, { status: 400 })
  }

  const redirectUris = body.redirect_uris ?? []
  if (!Array.isArray(redirectUris) || redirectUris.length === 0) {
    return Response.json(
      { error: 'invalid_redirect_uri', error_description: 'redirect_uris is required' },
      { status: 400 },
    )
  }

  for (const uri of redirectUris) {
    if (typeof uri !== 'string' || !isValidRedirectUri(uri)) {
      return Response.json(
        { error: 'invalid_redirect_uri', error_description: `Invalid redirect URI: ${uri}` },
        { status: 400 },
      )
    }
  }

  const clientId = randomId()
  const client: RegisteredClient = {
    client_id: clientId,
    client_name: body.client_name,
    redirect_uris: redirectUris,
    grant_types: body.grant_types ?? ['authorization_code', 'refresh_token'],
    response_types: body.response_types ?? ['code'],
    token_endpoint_auth_method: body.token_endpoint_auth_method ?? 'none',
  }

  return Response.json(
    {
      client_id: client.client_id,
      client_name: client.client_name,
      redirect_uris: client.redirect_uris,
      grant_types: client.grant_types,
      response_types: client.response_types,
      token_endpoint_auth_method: client.token_endpoint_auth_method,
    },
    { status: 201 },
  )
}