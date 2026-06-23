/// <reference types="@cloudflare/workers-types" />

import { handleMcp, type McpEnv } from '@nutrition-tracker/mcp-server/http'

export const onRequest = async (context: EventContext<McpEnv, string, unknown>) => {
  return handleMcp(context.request, context.env)
}
