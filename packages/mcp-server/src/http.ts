import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createAuthenticatedSupabase, createServer } from './server.js'

export interface McpEnv {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice(7).trim()
  return token || null
}

function unauthorized(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

/**
 * Stateless MCP handler suitable for Cloudflare Pages Functions and other
 * Web-standard runtimes. Each request creates a fresh transport and server,
 * handles the request, then returns the response.
 *
 * Requires `Authorization: Bearer <supabase_access_token>` on every request.
 */
export async function handleMcp(request: Request, env: McpEnv): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    })
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }

  const accessToken = extractBearerToken(request)
  if (!accessToken) {
    return unauthorized('Missing or invalid Authorization header (Bearer token required)')
  }

  const supabase = createAuthenticatedSupabase(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, accessToken)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return unauthorized(authError?.message ?? 'Invalid or expired access token')
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })
  const server = createServer(supabase)

  await server.connect(transport)
  try {
    const response = await transport.handleRequest(request)
    return withCors(response)
  } finally {
    await transport.close()
    await server.close()
  }
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'content-type, authorization, mcp-session-id, mcp-protocol-version',
    'Access-Control-Max-Age': '86400',
  }
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [k, v] of Object.entries(corsHeaders())) {
    if (!headers.has(k)) headers.set(k, v)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}