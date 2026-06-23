/// <reference types="@cloudflare/workers-types" />

import { handleAuthorizationServerMetadata } from '@nutrition-tracker/mcp-server/oauth'
import { resolveOAuthEnv, type PagesOAuthEnv } from '../_oauth-env'

export const onRequest = async (context: EventContext<PagesOAuthEnv, string, unknown>) => {
  return handleAuthorizationServerMetadata(resolveOAuthEnv(context.request, context.env))
}