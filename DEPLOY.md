# Cloudflare Deployment

Summary of the Cloudflare Pages setup and deploy steps after multi-user auth.

## What's in place

### Web app (`packages/web/`)
- Supabase Auth (email/password) with sign-in, sign-up, and log out
- Direct Supabase client queries with anon key + session JWT
- RLS scopes `food_entries` per user — no `/api/entries` proxy

### MCP server (`packages/mcp-server/`)
- `src/server.ts` — shared tool definitions; inserts include `user_id` from JWT
- `src/stdio.ts` — local stdio MCP; requires `SUPABASE_ACCESS_TOKEN`
- `src/http.ts` — JWT auth via `Authorization: Bearer`; uses anon key + user token

### Pages Functions (`packages/web/functions/`)
- `mcp/[[path]].ts` — wraps `handleMcp` from `@nutrition-tracker/mcp-server/http`

### Cloudflare config (`packages/web/wrangler.toml`)
- `pages_build_output_dir = "./dist"`
- Secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (for `/mcp` function)

## Routes exposed

| Path   | Purpose                                                    |
| ------ | ---------------------------------------------------------- |
| `/`    | Static React dashboard (auth required)                     |
| `/mcp` | MCP HTTP endpoint — `Authorization: Bearer <jwt>` required |

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run build -w @nutrition-tracker/mcp-server
```

## Deploy steps

### 1. Supabase

Run migrations in SQL editor:

```
packages/shared/migrations/0001_add_entry_date.sql
packages/shared/migrations/0002_auth_and_user_scoping.sql
```

Enable Email auth and set Site URL / redirect URLs in the Supabase dashboard.

### 2. Cloudflare one-time setup

```sh
npx wrangler login
npx wrangler pages project create nutrition-tracker --production-branch main
```

### 3. Secrets

```sh
npx wrangler pages secret put SUPABASE_URL      --project-name nutrition-tracker
npx wrangler pages secret put SUPABASE_ANON_KEY --project-name nutrition-tracker
```

### 4. Build and deploy

```sh
export VITE_SUPABASE_URL=https://<your-project>.supabase.co
export VITE_SUPABASE_ANON_KEY=<anon-key>
npm run build
npx wrangler pages deploy packages/web/dist --project-name nutrition-tracker --branch main
```

### 5. Connect an MCP client

Deployed MCP URL:

```
https://nutrition-tracker.pages.dev/mcp
```

Clients must send the user's Supabase `access_token` as a Bearer token on every request. Sign in via the web app, copy the token from the session, and configure your MCP client accordingly.

For local stdio development: set `SUPABASE_ACCESS_TOKEN` in `packages/mcp-server/.env` and run `npm run dev:mcp`.