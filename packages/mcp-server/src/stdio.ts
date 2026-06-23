import 'dotenv/config'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createAuthenticatedSupabase, createServer } from './server.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const accessToken = process.env.SUPABASE_ACCESS_TOKEN

if (!supabaseUrl || !supabaseAnonKey) {
  process.stderr.write('Missing SUPABASE_URL or SUPABASE_ANON_KEY\n')
  process.exit(1)
}
if (!accessToken) {
  process.stderr.write(
    'Missing SUPABASE_ACCESS_TOKEN — sign in via the web app and copy your session access token\n',
  )
  process.exit(1)
}

const supabase = createAuthenticatedSupabase(supabaseUrl, supabaseAnonKey, accessToken)
const {
  data: { user },
  error,
} = await supabase.auth.getUser()
if (error || !user) {
  process.stderr.write(`Invalid SUPABASE_ACCESS_TOKEN: ${error?.message ?? 'no user'}\n`)
  process.exit(1)
}

const server = createServer(supabase)
const transport = new StdioServerTransport()
await server.connect(transport)