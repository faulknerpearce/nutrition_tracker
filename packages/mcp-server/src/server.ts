import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  buildInsertPayload,
  goals,
  mapRow,
  parseEntryInput,
  sumTotals,
  todayISO,
  type Database,
  type FoodUpdate,
} from '@nutrition-tracker/shared'

export type NutritionSupabase = SupabaseClient<Database>

export function createSupabase(url: string, key: string): NutritionSupabase {
  return createClient<Database>(url, key)
}

export function createAuthenticatedSupabase(
  url: string,
  anonKey: string,
  accessToken: string,
): NutritionSupabase {
  return createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

/** JSON Schema object inputs — strict shape Grok and other MCP clients expect. */
function objectSchema(
  properties: Record<string, Record<string, unknown>>,
  required?: string[],
): Tool['inputSchema'] {
  return {
    type: 'object',
    properties,
    ...(required?.length ? { required } : {}),
    additionalProperties: false,
  }
}

async function requireUserId(supabase: NutritionSupabase): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export const tools: Tool[] = [
  {
    name: 'list_food_entries',
    description: 'List all food log entries for today (entry_date = current date)',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
  {
    name: 'add_food_entry',
    description: "Add a new food entry to today's log",
    inputSchema: objectSchema(
      {
        name: { type: 'string', description: 'Name of the food item' },
        description: { type: 'string', description: 'Optional description (e.g. Lunch)' },
        calories: { type: 'number', description: 'Calories (kcal)' },
        protein: { type: 'number', description: 'Protein in grams' },
        carbs: { type: 'number', description: 'Carbohydrates in grams' },
        caffeine: { type: 'number', description: 'Caffeine in mg (default 0)' },
        icon: { type: 'string', description: 'Font Awesome icon class (default fa-utensils)' },
        iconBg: { type: 'string', description: 'Background color hex (default #f4f4f5)' },
        iconColor: { type: 'string', description: 'Icon color hex (default #71717a)' },
      },
      ['name', 'calories', 'protein'],
    ),
  },
  {
    name: 'update_food_entry',
    description: 'Update an existing food entry by id',
    inputSchema: objectSchema(
      {
        id: { type: 'string', description: 'ID of the entry to update' },
        name: { type: 'string' },
        description: { type: 'string' },
        calories: { type: 'number' },
        protein: { type: 'number' },
        carbs: { type: 'number' },
        caffeine: { type: 'number' },
        icon: { type: 'string' },
        iconBg: { type: 'string' },
        iconColor: { type: 'string' },
      },
      ['id'],
    ),
  },
  {
    name: 'delete_food_entry',
    description: 'Delete a food entry by id',
    inputSchema: objectSchema(
      { id: { type: 'string', description: 'ID of the entry to delete' } },
      ['id'],
    ),
  },
  {
    name: 'get_daily_totals',
    description: 'Get the summed daily totals and remaining goals for today',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
]

export function createServer(supabase: NutritionSupabase): Server {
  const server = new Server(
    { name: 'nutrition-tracker', version: '1.0.0' },
    {
      capabilities: { tools: { listChanged: false } },
      instructions:
        'Nutrition Tracker food log tools. Use list_food_entries and get_daily_totals to read logs; add_food_entry, update_food_entry, and delete_food_entry to modify them. All data is scoped to the signed-in user.',
    },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    const a = (args ?? {}) as Record<string, unknown>

    try {
      switch (name) {
        case 'list_food_entries': {
          const date = typeof a.date === 'string' ? a.date : todayISO()
          const { data, error } = await supabase
            .from('food_entries')
            .select('*')
            .eq('entry_date', date)
            .order('created_at', { ascending: true })
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify((data ?? []).map(mapRow)) }] }
        }

        case 'add_food_entry': {
          const parsed = parseEntryInput(a)
          if (!parsed.ok) throw new Error(parsed.error)

          const userId = await requireUserId(supabase)
          const entry = {
            ...buildInsertPayload(parsed.value, crypto.randomUUID(), userId),
            entry_date: todayISO(),
          }
          const { data, error } = await supabase
            .from('food_entries')
            .insert(entry)
            .select()
            .single()
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify(mapRow(data)) }] }
        }

        case 'update_food_entry': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')

          const updates: FoodUpdate = {}
          const stringFields = {
            name: 'name',
            description: 'description',
            icon: 'icon',
            iconBg: 'icon_bg',
            iconColor: 'icon_color',
          } as const
          for (const [jsKey, dbKey] of Object.entries(stringFields)) {
            if (a[jsKey] !== undefined) (updates as Record<string, unknown>)[dbKey] = a[jsKey]
          }
          for (const field of ['calories', 'protein', 'carbs', 'caffeine'] as const) {
            if (typeof a[field] === 'number')
              (updates as Record<string, unknown>)[field] = Math.round(a[field] as number)
          }

          const { data, error } = await supabase
            .from('food_entries')
            .update(updates)
            .eq('id', a.id)
            .select()
            .single()
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify(mapRow(data)) }] }
        }

        case 'delete_food_entry': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')
          const { error } = await supabase.from('food_entries').delete().eq('id', a.id)
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify({ ok: true }) }] }
        }

        case 'get_daily_totals': {
          const date = typeof a.date === 'string' ? a.date : todayISO()
          const { data, error } = await supabase
            .from('food_entries')
            .select('*')
            .eq('entry_date', date)
          if (error) throw error
          const totals = sumTotals((data ?? []).map(mapRow))
          return { content: [{ type: 'text', text: JSON.stringify({ totals, goals, date }) }] }
        }

        default:
          throw new Error(`Unknown tool: ${name}`)
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      }
    }
  })

  return server
}
