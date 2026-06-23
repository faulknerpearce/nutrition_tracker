import { tools } from './server.js'

/** Public tool catalog for connector registration probes (no auth required). */
export function handlePublicToolSchema(): Response {
  return Response.json(
    { tools },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  )
}