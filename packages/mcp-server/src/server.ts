import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { parseLogDate, todayISO } from '@nutrition-tracker/shared'
import type { NutritionSupabase } from './supabase.js'
import {
  addActivityForDate,
  addFoodEntryForDate,
  deleteActivity,
  deleteFoodEntry,
  getActivityTotalsForDate,
  getDailyTotalsForDate,
  isManageDayLogAction,
  listActivitiesForDate,
  listFoodEntriesForDate,
  manageDayLog,
  updateActivity,
  updateFoodEntry,
} from './toolHandlers.js'
import {
  deleteRecipe,
  getRecipe,
  listRecipes,
  logRecipeEntry,
  saveRecipe,
} from './recipeHandlers.js'

export { createAuthenticatedSupabase, type NutritionSupabase } from './supabase.js'

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

const dateProperty = {
  type: 'string',
  description: 'ISO date (YYYY-MM-DD). Defaults to today. Past dates are allowed.',
}

const foodFields = {
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
}

const activityFields = {
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
}

function resolveLogDateArg(value: unknown): string {
  const parsed = parseLogDate(value, { fallback: todayISO() })
  if (!parsed.ok) throw new Error(parsed.error)
  return parsed.value
}

function resolveRequiredLogDateArg(value: unknown): string {
  const parsed = parseLogDate(value)
  if (!parsed.ok) throw new Error(parsed.error)
  return parsed.value
}

export const SERVER_NAME = 'nutrition_tracker'
export const SERVER_VERSION = '1.2.0'

export const tools: Tool[] = [
  {
    name: 'list_food_entries',
    description:
      'Nutrition Tracker: list food log entries and meals for a day (calories, protein, carbs, fat, fiber, caffeine). Works for past days.',
    inputSchema: objectSchema({ date: dateProperty }),
  },
  {
    name: 'add_food_entry',
    description:
      'Nutrition Tracker: add a food or meal entry to the daily nutrition log with calories and macros. Pass date to log on a past day.',
    inputSchema: objectSchema(
      {
        date: dateProperty,
        ...foodFields,
      },
      ['name', 'calories', 'protein'],
    ),
  },
  {
    name: 'update_food_entry',
    description:
      'Nutrition Tracker: update an existing food log entry by id. Pass date to move the entry to another day.',
    inputSchema: objectSchema(
      {
        id: { type: 'string', description: 'ID of the entry to update' },
        date: dateProperty,
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
      'Nutrition Tracker: get daily nutrition totals (calories, protein, carbs, fat, fiber, caffeine) and remaining macro goals. Works for past days.',
    inputSchema: objectSchema({ date: dateProperty }),
  },
  {
    name: 'list_activities',
    description:
      'Nutrition Tracker: list activity outputs (workouts) for a day — type, duration, distance, heart rate, calories burned. Works for past days.',
    inputSchema: objectSchema({ date: dateProperty }),
  },
  {
    name: 'add_activity',
    description:
      'Nutrition Tracker: log a manual activity output with type, duration, distance, heart rate, and calories burned. Pass date to log on a past day.',
    inputSchema: objectSchema(
      {
        date: dateProperty,
        ...activityFields,
      },
      ['name', 'activityType', 'durationMinutes'],
    ),
  },
  {
    name: 'update_activity',
    description:
      'Nutrition Tracker: update an existing activity output by id. Pass date to move the activity to another day.',
    inputSchema: objectSchema(
      {
        id: { type: 'string', description: 'ID of the activity to update' },
        date: dateProperty,
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
      'Nutrition Tracker: get daily activity totals (calories burned, total duration, total distance). Works for past days.',
    inputSchema: objectSchema({ date: dateProperty }),
  },
  {
    name: 'manage_day_log',
    description:
      'Nutrition Tracker: add, list, or edit food and activity logs for any calendar day, including past days. Use action=list to read a day; add_food/add_activity to create; update_* to edit by id; delete_* to remove.',
    inputSchema: objectSchema(
      {
        date: {
          type: 'string',
          description: 'ISO date (YYYY-MM-DD) for the day to manage (required)',
        },
        action: {
          type: 'string',
          enum: [
            'list',
            'add_food',
            'update_food',
            'delete_food',
            'add_activity',
            'update_activity',
            'delete_activity',
          ],
          description: 'Operation to perform for the given date',
        },
        id: { type: 'string', description: 'Entry id (required for update/delete actions)' },
        ...foodFields,
        ...activityFields,
      },
      ['date', 'action'],
    ),
  },
  {
    name: 'list_recipes',
    description:
      'Nutrition Tracker: list saved meal recipes with per-serving macro totals and ingredient counts.',
    inputSchema: objectSchema({}),
  },
  {
    name: 'get_recipe',
    description: 'Nutrition Tracker: get a saved recipe with all ingredient lines and macro totals.',
    inputSchema: objectSchema(
      { id: { type: 'string', description: 'Recipe id' } },
      ['id'],
    ),
  },
  {
    name: 'save_recipe',
    description:
      'Nutrition Tracker: create or update a saved recipe and its ingredient lines. Pass id to update.',
    inputSchema: objectSchema({
      id: { type: 'string', description: 'Recipe id when updating' },
      name: { type: 'string', description: 'Recipe name' },
      description: { type: 'string', description: 'Optional description' },
      defaultServings: {
        type: 'number',
        description: 'How many servings the ingredient batch yields',
      },
      icon: { type: 'string' },
      iconBg: { type: 'string' },
      iconColor: { type: 'string' },
      ingredients: {
        type: 'array',
        description: 'Ingredient lines that sum to the full recipe batch',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            amount: { type: 'string' },
            calories: { type: 'number' },
            protein: { type: 'number' },
            carbs: { type: 'number' },
            fat: { type: 'number' },
            fiber: { type: 'number' },
            caffeine: { type: 'number' },
          },
          required: ['name', 'calories', 'protein'],
        },
      },
    }, ['name', 'ingredients']),
  },
  {
    name: 'delete_recipe',
    description: 'Nutrition Tracker: delete a saved recipe by id.',
    inputSchema: objectSchema({ id: { type: 'string', description: 'Recipe id' } }, ['id']),
  },
  {
    name: 'log_recipe',
    description:
      'Nutrition Tracker: log one food entry from a saved recipe with servings scaling. Creates a single aggregated food log row.',
    inputSchema: objectSchema(
      {
        recipeId: { type: 'string', description: 'Recipe id to log' },
        servings: { type: 'number', description: 'Number of servings to log (default 1)' },
        date: dateProperty,
      },
      ['recipeId'],
    ),
  },
]

export function createServer(supabase: NutritionSupabase): Server {
  const foodTools = tools
    .filter(
      (t) =>
        t.name.endsWith('_food_entry') ||
        t.name === 'get_daily_totals' ||
        t.name === 'manage_day_log',
    )
    .map((t) => t.name)
  const activityTools = tools
    .filter(
      (t) =>
        t.name.endsWith('_activity') ||
        t.name === 'get_activity_totals' ||
        t.name === 'manage_day_log',
    )
    .map((t) => t.name)
  const recipeTools = tools
    .filter((t) => t.name.endsWith('_recipe') || t.name === 'list_recipes')
    .map((t) => t.name)
  const instructions = `Nutrition Tracker tools for food inputs, saved recipes, and activity outputs. Food: ${foodTools.join(', ')}. Recipes: ${recipeTools.join(', ')}. Activities: ${activityTools.join(', ')}. Use log_recipe or add_food_entry to log meals. All data is scoped to the signed-in user.`

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
          const date = resolveLogDateArg(a.date)
          const entries = await listFoodEntriesForDate(supabase, date)
          return { content: [{ type: 'text', text: JSON.stringify(entries) }] }
        }

        case 'add_food_entry': {
          const date = resolveLogDateArg(a.date)
          const entry = await addFoodEntryForDate(supabase, date, a)
          return { content: [{ type: 'text', text: JSON.stringify(entry) }] }
        }

        case 'update_food_entry': {
          if (typeof a.date === 'string') a.date = resolveRequiredLogDateArg(a.date)
          const entry = await updateFoodEntry(supabase, a)
          return { content: [{ type: 'text', text: JSON.stringify(entry) }] }
        }

        case 'delete_food_entry': {
          const result = await deleteFoodEntry(supabase, a)
          return { content: [{ type: 'text', text: JSON.stringify(result) }] }
        }

        case 'get_daily_totals': {
          const date = resolveLogDateArg(a.date)
          const result = await getDailyTotalsForDate(supabase, date)
          return { content: [{ type: 'text', text: JSON.stringify(result) }] }
        }

        case 'list_activities': {
          const date = resolveLogDateArg(a.date)
          const entries = await listActivitiesForDate(supabase, date)
          return { content: [{ type: 'text', text: JSON.stringify(entries) }] }
        }

        case 'add_activity': {
          const date = resolveLogDateArg(a.date)
          const activity = await addActivityForDate(supabase, date, a)
          return { content: [{ type: 'text', text: JSON.stringify(activity) }] }
        }

        case 'update_activity': {
          if (typeof a.date === 'string') a.date = resolveRequiredLogDateArg(a.date)
          const activity = await updateActivity(supabase, a)
          return { content: [{ type: 'text', text: JSON.stringify(activity) }] }
        }

        case 'delete_activity': {
          const result = await deleteActivity(supabase, a)
          return { content: [{ type: 'text', text: JSON.stringify(result) }] }
        }

        case 'get_activity_totals': {
          const date = resolveLogDateArg(a.date)
          const result = await getActivityTotalsForDate(supabase, date)
          return { content: [{ type: 'text', text: JSON.stringify(result) }] }
        }

        case 'manage_day_log': {
          const date = resolveRequiredLogDateArg(a.date)
          if (!isManageDayLogAction(a.action)) {
            throw new Error(
              'action is required (list, add_food, update_food, delete_food, add_activity, update_activity, delete_activity)',
            )
          }
          const result = await manageDayLog(supabase, date, a.action, a)
          return { content: [{ type: 'text', text: JSON.stringify(result) }] }
        }

        case 'list_recipes': {
          const recipes = await listRecipes(supabase)
          return { content: [{ type: 'text', text: JSON.stringify(recipes) }] }
        }

        case 'get_recipe': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')
          const recipe = await getRecipe(supabase, a.id)
          return { content: [{ type: 'text', text: JSON.stringify(recipe) }] }
        }

        case 'save_recipe': {
          const recipe = await saveRecipe(supabase, a)
          return { content: [{ type: 'text', text: JSON.stringify(recipe) }] }
        }

        case 'delete_recipe': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')
          const result = await deleteRecipe(supabase, a.id)
          return { content: [{ type: 'text', text: JSON.stringify(result) }] }
        }

        case 'log_recipe': {
          const entry = await logRecipeEntry(supabase, a)
          return { content: [{ type: 'text', text: JSON.stringify(entry) }] }
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