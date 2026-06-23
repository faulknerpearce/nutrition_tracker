import { describe, expect, it } from 'vitest'
import { ToolSchema } from '@modelcontextprotocol/sdk/types.js'
import { tools } from '../server.js'

describe('MCP tool schemas', () => {
  it('validates every tool against the MCP ToolSchema', () => {
    for (const tool of tools) {
      const result = ToolSchema.safeParse(tool)
      expect(result.success, JSON.stringify(result.success ? null : result.error.issues, null, 2)).toBe(
        true,
      )
    }
  })

  it('uses additionalProperties: false on every input schema', () => {
    for (const tool of tools) {
      expect(tool.inputSchema.additionalProperties).toBe(false)
    }
  })
})