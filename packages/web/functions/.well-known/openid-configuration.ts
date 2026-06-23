/// <reference types="@cloudflare/workers-types" />

import { handleOpenIdConfigurationMetadata } from '@nutrition-tracker/mcp-server/oauth'
import { resolveOAuthEnv, type PagesOAuthEnv } from '../_oauth-env'

export const onRequest = async (context: EventContext<PagesOAuthEnv, string, unknown>) => {
  return handleOpenIdConfigurationMetadata(resolveOAuthEnv(context.request, context.env))
}