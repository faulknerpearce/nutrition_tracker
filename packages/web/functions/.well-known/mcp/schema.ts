/// <reference types="@cloudflare/workers-types" />

import { handlePublicToolSchema } from '@nutrition-tracker/mcp-server/schema'

export const onRequest = async () => handlePublicToolSchema()