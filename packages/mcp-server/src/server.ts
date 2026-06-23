import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  buildActivityInsertPayload,
  buildActivityUpdatePayload,
  buildInsertPayload,
  buildUpdatePayload,
  DEFAULT_NUTRITION_GOALS,
  mapActivityRow,
  parseNutritionGoals,
  mapRow,
  parseActivityInput,
  parseEntryInput,
  sumActivityTotals,
  sumTotals,
  todayISO,
  type ActivityUpdate,
  type Database,
  type FoodUpdate,
} from '@nutrition-tracker/shared'

export type NutritionSupabase = SupabaseClient<Database>

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

async function fetchUserGoals(supabase: NutritionSupabase) {
  const userId = await requireUserId(supabase)
  const { data, error } = await supabase
    .from('profiles')
    .select('nutrition_goals')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return parseNutritionGoals(data?.nutrition_goals ?? DEFAULT_NUTRITION_GOALS)
}

export const SERVER_NAME = 'nutrition_tracker'
export const SERVER_VERSION = '1.0.0'

export const tools: Tool[] = [
  {
    name: 'list_food_entries',
    description:
      'Nutrition Tracker: list food log entries and meals for a day (calories, protein, carbs, fat, fiber, caffeine).',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
  {
    name: 'add_food_entry',
    description:
      'Nutrition Tracker: add a food or meal entry to the daily nutrition log with calories and macros.',
    inputSchema: objectSchema(
      {
        name: { type: 'string', description: 'Name of the food item' },
        description: { type: 'string', description: 'Optional description (e.g. Lunch)' },
        calories: { type: 'number', description: 'Calories (kcal)' },
        protein: { type: 'number', description: 'Protein in grams' },
        carbs: { type: 'number', description: 'Carbohydrates in grams' },
        fat: { type: 'number', description: 'Fat in grams (default 0)' },
        fiber: { type: 'number', description: 'Fiber in grams (default 0)' },
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
    description: 'Nutrition Tracker: update an existing food log entry by id.',
    inputSchema: objectSchema(
      {
        id: { type: 'string', description: 'ID of the entry to update' },
        name: { type: 'string' },
        description: { type: 'string' },
        calories: { type: 'number' },
        protein: { type: 'number' },
        carbs: { type: 'number' },
        fat: { type: 'number' },
        fiber: { type: 'number' },
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
    description: 'Nutrition Tracker: delete a food log entry by id.',
    inputSchema: objectSchema(
      { id: { type: 'string', description: 'ID of the entry to delete' } },
      ['id'],
    ),
  },
  {
    name: 'get_daily_totals',
    description:
      'Nutrition Tracker: get daily nutrition totals (calories, protein, carbs, fat, fiber, caffeine) and remaining macro goals.',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
  {
    name: 'list_activities',
    description:
      'Nutrition Tracker: list activity outputs (workouts) for a day — type, duration, distance, heart rate, calories burned.',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
  {
    name: 'add_activity',
    description:
      'Nutrition Tracker: log a manual activity output with type, duration, distance, heart rate, and calories burned.',
    inputSchema: objectSchema(
      {
        name: { type: 'string', description: 'Name of the activity (e.g. Morning Run)' },
        activityType: {
          type: 'string',
          description: 'Activity type (e.g. Run, Ride, Swim, Walk, Workout)',
        },
        durationMinutes: {
          type: 'number',
          description: 'Duration in minutes (converted to seconds internally)',
        },
        distanceKm: {
          type: 'number',
          description: 'Optional distance in kilometers',
        },
        averageHeartrate: {
          type: 'number',
          description: 'Optional average heart rate in bpm',
        },
        maxHeartrate: { type: 'number', description: 'Optional max heart rate in bpm' },
        calories: { type: 'number', description: 'Optional calories burned' },
      },
      ['name', 'activityType', 'durationMinutes'],
    ),
  },
  {
    name: 'update_activity',
    description: 'Nutrition Tracker: update an existing activity output by id.',
    inputSchema: objectSchema(
      {
        id: { type: 'string', description: 'ID of the activity to update' },
        name: { type: 'string' },
        activityType: { type: 'string' },
        durationMinutes: { type: 'number' },
        distanceKm: { type: 'number' },
        averageHeartrate: { type: 'number' },
        maxHeartrate: { type: 'number' },
        calories: { type: 'number' },
      },
      ['id'],
    ),
  },
  {
    name: 'delete_activity',
    description: 'Nutrition Tracker: delete an activity output by id.',
    inputSchema: objectSchema(
      { id: { type: 'string', description: 'ID of the activity to delete' } },
      ['id'],
    ),
  },
  {
    name: 'get_activity_totals',
    description:
      'Nutrition Tracker: get daily activity totals (calories burned, total duration, total distance).',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
]

export function createServer(supabase: NutritionSupabase): Server {
  const foodTools = tools
    .filter((t) => t.name.endsWith('_food_entry') || t.name === 'get_daily_totals')
    .map((t) => t.name)
  const activityTools = tools
    .filter((t) => t.name.endsWith('_activity') || t.name === 'get_activity_totals')
    .map((t) => t.name)
  const instructions = `Nutrition Tracker tools for food inputs and activity outputs. Food: ${foodTools.join(', ')}. Activities: ${activityTools.join(', ')}. All data is scoped to the signed-in user.`

  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      capabilities: { tools: { listChanged: false } },
      instructions,
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

          // Route the partial update through the same parser/builder used for
          // inserts so camelCase↔snake_case mapping and rounding live in one place.
          // parseEntryInput requires name+calories+protein; for partial updates
          // we only carry the fields the caller actually sent.
          const partial: Record<string, unknown> = {
            name: a.name ?? ' ',
            description: typeof a.description === 'string' ? a.description : '',
            calories: typeof a.calories === 'number' ? a.calories : 0,
            protein: typeof a.protein === 'number' ? a.protein : 0,
            carbs: typeof a.carbs === 'number' ? a.carbs : 0,
            fat: typeof a.fat === 'number' ? a.fat : 0,
            fiber: typeof a.fiber === 'number' ? a.fiber : 0,
            caffeine: typeof a.caffeine === 'number' ? a.caffeine : 0,
          }
          if (typeof a.icon === 'string') partial.icon = a.icon
          if (typeof a.iconBg === 'string') partial.iconBg = a.iconBg
          if (typeof a.iconColor === 'string') partial.iconColor = a.iconColor

          const parsed = parseEntryInput(partial)
          if (!parsed.ok) throw new Error(parsed.error)
          const updates = buildUpdatePayload(parsed.value) as FoodUpdate

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
          const userGoals = await fetchUserGoals(supabase)
          return {
            content: [{ type: 'text', text: JSON.stringify({ totals, goals: userGoals, date }) }],
          }
        }

        case 'list_activities': {
          const date = typeof a.date === 'string' ? a.date : todayISO()
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('activity_date', date)
            .order('created_at', { ascending: true })
          if (error) throw error
          return {
            content: [{ type: 'text', text: JSON.stringify((data ?? []).map(mapActivityRow)) }],
          }
        }

        case 'add_activity': {
          const parsed = parseActivityInput(a)
          if (!parsed.ok) throw new Error(parsed.error)

          const userId = await requireUserId(supabase)
          const activity = buildActivityInsertPayload(
            parsed.value,
            crypto.randomUUID(),
            userId,
            todayISO(),
          )
          const { data, error } = await supabase
            .from('activities')
            .insert(activity)
            .select()
            .single()
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify(mapActivityRow(data)) }] }
        }

        case 'update_activity': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')

          // partial updates: pass whatever the caller sent; parseActivityInput
          // accepts both camelCase (web) and snake_case (MCP native) keys.
          const partial: Record<string, unknown> = {}
          if (a.name !== undefined) partial.name = a.name
          if (a.activityType !== undefined) partial.activityType = a.activityType
          if (a.activity_type !== undefined) partial.activity_type = a.activity_type
          if (a.durationMinutes !== undefined) partial.durationMinutes = a.durationMinutes
          if (a.movingTimeSeconds !== undefined) partial.movingTimeSeconds = a.movingTimeSeconds
          if (a.moving_time_seconds !== undefined)
            partial.moving_time_seconds = a.moving_time_seconds
          if (a.distanceKm !== undefined) partial.distanceKm = a.distanceKm
          if (a.distanceMeters !== undefined) partial.distanceMeters = a.distanceMeters
          if (a.distance_meters !== undefined) partial.distance_meters = a.distance_meters
          if (a.averageHeartrate !== undefined) partial.averageHeartrate = a.averageHeartrate
          if (a.average_heartrate !== undefined) partial.average_heartrate = a.average_heartrate
          if (a.maxHeartrate !== undefined) partial.maxHeartrate = a.maxHeartrate
          if (a.max_heartrate !== undefined) partial.max_heartrate = a.max_heartrate
          if (a.calories !== undefined) partial.calories = a.calories

          // parseActivityInput requires movingTimeSeconds; if the caller only
          // sent durationMinutes the parser handles that internally.
          if (
            partial.movingTimeSeconds === undefined &&
            partial.moving_time_seconds === undefined &&
            partial.durationMinutes === undefined
          ) {
            throw new Error('at least one of durationMinutes or movingTimeSeconds is required')
          }
          // Provide a placeholder so the validator does not reject the call.
          if (
            partial.movingTimeSeconds === undefined &&
            partial.moving_time_seconds === undefined
          ) {
            partial.durationMinutes =
              typeof partial.durationMinutes === 'number' ? partial.durationMinutes : 1
          }

          const parsed = parseActivityInput(partial)
          if (!parsed.ok) throw new Error(parsed.error)
          const updates = buildActivityUpdatePayload(parsed.value) as ActivityUpdate

          const { data, error } = await supabase
            .from('activities')
            .update(updates)
            .eq('id', a.id)
            .select()
            .single()
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify(mapActivityRow(data)) }] }
        }

        case 'delete_activity': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')
          const { error } = await supabase.from('activities').delete().eq('id', a.id)
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify({ ok: true }) }] }
        }

        case 'get_activity_totals': {
          const date = typeof a.date === 'string' ? a.date : todayISO()
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('activity_date', date)
          if (error) throw error
          const totals = sumActivityTotals((data ?? []).map(mapActivityRow))
          return { content: [{ type: 'text', text: JSON.stringify({ totals, date }) }] }
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
