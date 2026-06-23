import { describe, expect, it } from 'vitest'
import { ToolSchema } from '@modelcontextprotocol/sdk/types.js'
import { publicToolManifest } from '../schema.js'

describe('publicToolManifest', () => {
  it('exposes server metadata and valid tools for connector probes', () => {
    const manifest = publicToolManifest()

    expect(manifest.serverInfo.name).toBe('nutrition_tracker')
    expect(manifest.tools).toHaveLength(16)

    for (const tool of manifest.tools) {
      expect(ToolSchema.safeParse(tool).success).toBe(true)
      expect(tool.description?.toLowerCase()).toContain('nutrition tracker')
    }
  })
})
